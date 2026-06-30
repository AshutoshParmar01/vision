import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SignupFormDemo } from "#components/features/auth/components/signup"
import { LampDemo } from "#components/features/landingPage/hero"
import { FileUploadDemo } from '#components/features/upload/upload'
import Gallery from "#components/features/feed/gallery"
import ProfilePage from '#components/features/account/ProfilePage'

const App = () => {
  return (
    <div>
      <Router>
        <div className="flex flex-col min-h-screen">
          <main className="grow">
            <Routes>
              <Route path="/" element = {<LampDemo />} />
              <Route path="/signup" element = {<SignupFormDemo />} />
              <Route path="/upload" element = {<FileUploadDemo />} />
              <Route path="/gallery" element = {<Gallery />} />
              <Route path="/profile" element = {<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  )
}

export default App
