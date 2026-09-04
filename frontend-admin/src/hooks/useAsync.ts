import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'

const inFlightQueries = new Map<string, Promise<unknown>>()

function runQuery<T>(key: string, queryFn: () => Promise<T>): Promise<T> {
  const activeQuery = inFlightQueries.get(key) as Promise<T> | undefined
  if (activeQuery) return activeQuery

  const query = queryFn().finally(() => {
    if (inFlightQueries.get(key) === query) inFlightQueries.delete(key)
  })
  inFlightQueries.set(key, query)
  return query
}

export function useAsyncQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  dependencies: DependencyList = [],
  enabled = true,
) {
  const queryRef = useRef(queryFn)
  const requestRef = useRef(0)
  const [data, setData] = useState<T>()
  const [error, setError] = useState<unknown>()
  const [isLoading, setIsLoading] = useState(enabled)
  const [revision, setRevision] = useState(0)
  queryRef.current = queryFn

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false)
      return
    }

    const requestId = ++requestRef.current
    setIsLoading(true)
    setError(undefined)

    void runQuery(queryKey, queryRef.current)
      .then((result) => {
        if (requestRef.current === requestId) setData(result)
      })
      .catch((reason: unknown) => {
        if (requestRef.current === requestId) setError(reason)
      })
      .finally(() => {
        if (requestRef.current === requestId) setIsLoading(false)
      })

    return () => {
      if (requestRef.current === requestId) requestRef.current += 1
    }
  }, [enabled, queryKey, revision, ...dependencies])

  const refetch = useCallback(() => setRevision((value) => value + 1), [])

  return { data, error, isLoading, isError: Boolean(error), refetch }
}

type MutationOptions<TArgs extends unknown[], TResult> = {
  mutationFn: (...args: TArgs) => Promise<TResult> | TResult
  onSuccess?: (data: TResult, ...args: TArgs) => void | Promise<void>
  onError?: (error: unknown, ...args: TArgs) => void
}

export function useAsyncMutation<TArgs extends unknown[], TResult>(
  options: MutationOptions<TArgs, TResult>,
) {
  const optionsRef = useRef(options)
  const [isPending, setIsPending] = useState(false)
  optionsRef.current = options

  const mutateAsync = useCallback(async (...args: TArgs) => {
    setIsPending(true)
    try {
      const result = await optionsRef.current.mutationFn(...args)
      await optionsRef.current.onSuccess?.(result, ...args)
      return result
    } catch (error) {
      optionsRef.current.onError?.(error, ...args)
      throw error
    } finally {
      setIsPending(false)
    }
  }, [])

  const mutate = useCallback(
    (...args: TArgs) => {
      void mutateAsync(...args).catch(() => undefined)
    },
    [mutateAsync],
  )

  return { mutate, mutateAsync, isPending }
}
