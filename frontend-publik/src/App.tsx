import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from '@/components/layout/PublicLayout'
import HomePage from '@/pages/Home/Home'
import CoursesPage from '@/pages/Courses/Courses'
import CourseDetailPage from '@/pages/CourseDetail/CourseDetail'
import MaterialDetailPage from '@/pages/MaterialDetail/MaterialDetail'
import SchedulePage from '@/pages/Schedule/Schedule'
import SearchPage from '@/pages/Search/Search'
import AboutPage from '@/pages/About/About'
import NotFoundPage from '@/pages/NotFound/NotFound'

export default function App() {
  return <Routes><Route element={<PublicLayout />}><Route index element={<HomePage />} /><Route path="matakuliah" element={<CoursesPage />} /><Route path="matakuliah/:id" element={<CourseDetailPage />} /><Route path="materi/:id" element={<MaterialDetailPage />} /><Route path="jadwal" element={<SchedulePage />} /><Route path="search" element={<SearchPage />} /><Route path="tentang" element={<AboutPage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes>
}
