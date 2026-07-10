import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SignupFormDemo } from "#components/features/auth/components/signup"
import { LampDemo } from "#components/features/landingPage/hero"
import { FileUploadDemo } from '#components/features/upload/upload'
import Gallery from "#components/features/feed/gallery"
import ProfilePage from '#components/features/account/ProfilePage'
import People from '#components/features/people/people'
import PersonGallery from '#components/features/people/peopleGallery'
import UnderConstruction from '#components/features/underconstruction/underconstruction'
import { LoginFormDemo } from '#components/features/auth/components/login'
import Albums from '#components/features/albums/Albums'
import AlbumView from '#components/features/albums/AlbumView'
import Stream from '#components/features/stream/stream'

const App = () => {
  return (
    <div>
      <Router>
        <div className="flex flex-col min-h-screen">
          <main className="grow">
            <Routes>
              <Route path="/" element={<LampDemo />} />
              <Route path="/signup" element={<SignupFormDemo />} />
              <Route path="/login" element={<LoginFormDemo />} />
              <Route path="/upload" element={<FileUploadDemo />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/people" element={<People />}/>
              <Route path="/people/:personId" element={<PersonGallery />} />
              <Route path="/uc" element={<UnderConstruction />} />
              <Route path="/albums" element={<Albums />} />
              <Route path="/stream" element={<Stream />} />
              <Route path="/albums/:albumId" element={<AlbumView />} />
            </Routes>
          </main>
        </div>
      </Router>
    </div>
  )
}

export default App
