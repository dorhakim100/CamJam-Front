import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { smoothScroll } from '../../services/util.service'

import { RootState } from '../../store/store'

import InstagramIcon from '@mui/icons-material/Instagram'
import FacebookIcon from '@mui/icons-material/Facebook'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import PlaceIcon from '@mui/icons-material/Place'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import MailIcon from '@mui/icons-material/Mail'

export function AppFooter() {
  const navigate = useNavigate()

  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  const address = 'Address 19'

  const phone = '09-958-0404'
  const email = 'service.kfar@gmail.com'
  const rights = 'All rights reserved, Dor Hakim'

  const links = {
    facebook: 'https://www.facebook.com/moadonsportkfar/?locale=he_IL',
    instagram: 'https://www.instagram.com/moadonsport/',
    whatsapp: 'https://wa.me/972522681757',
  }

  const handleCopyToClipboard = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault() // Prevent navigation to `mailto`
    try {
      await navigator.clipboard.writeText(email)
      showSuccessMsg('Email copied')
    } catch (err) {
      // // console.log(err)
      showErrorMsg(`Couldn't copy email`)
    }
  }

  const openLink = (link: string) => {
    window.open(link)
  }

  const navigateToAbout = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault() // Stop the link from navigating immediately
    smoothScroll()

    setTimeout(() => {
      navigate('/about')
    }, 300) // Adjust time based on your smoothScroll timing
  }

  const call = () => {
    window.location.href = `tel:${phone}`
  }

  return (
    <footer
      className={`app-footer full ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      <div className='contact-container'>
        <div className='method-container address' onClick={navigateToAbout}>
          <PlaceIcon />
          <div className='address-container'>
            <span>{address}</span>
          </div>
        </div>
        <div className='method-container phone' onClick={call}>
          <LocalPhoneIcon />
          <span className={prefs.isDarkMode ? 'dark-mode' : ''}>{phone}</span>
        </div>
        <div
          className={`method-container email`}
          onClick={handleCopyToClipboard}
        >
          <MailIcon />
          <span className={`clickable ${prefs.isDarkMode && 'dark-mode'}`}>
            {email}
          </span>
        </div>
      </div>
      <div className='links-container'>
        <div
          className='social-container facebook-container'
          onClick={() => {
            openLink(links.facebook)
          }}
        >
          <FacebookIcon />
        </div>
        <div
          className='social-container whatsapp-container'
          onClick={() => {
            openLink(links.whatsapp)
          }}
        >
          <WhatsAppIcon />
        </div>
        <div
          className='social-container instagram-container'
          onClick={() => {
            openLink(links.instagram)
          }}
        >
          <InstagramIcon />
        </div>
      </div>

      <span>
        {rights} &copy; {new Date().getFullYear()}
      </span>
    </footer>
  )
}
