// import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'

import { RootState } from '../../store/store'

import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone'
import MailIcon from '@mui/icons-material/Mail'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import GitHubIcon from '@mui/icons-material/GitHub'
import { setIsLoading } from '../../store/actions/system.actions'

export function AppFooter() {
  // const navigate = useNavigate()

  const prefs = useSelector(
    (storeState: RootState) => storeState.systemModule.prefs
  )

  // const address = 'Address 19'

  const phone = '054-204-022'
  const email = 'dorhakim100@gmail.com'
  // const rights = 'All rights reserved, Dor Hakim'

  // const links = {
  //   facebook: 'https://www.facebook.com/moadonsportkfar/?locale=he_IL',
  //   instagram: 'https://www.instagram.com/moadonsport/',
  //   whatsapp: 'https://wa.me/972542044022',
  // }

  const socials = [
    {
      platform: 'WhatsApp',
      link: 'https://wa.me/972542044022',
      icon: <WhatsAppIcon />,
    },
    {
      platform: 'LinkedIn',
      link: 'https://www.linkedin.com/in/dor-hakim/',
      icon: <LinkedInIcon />,
    },
    {
      platform: 'GitHub',
      link: 'https://github.com/dorhakim100',
      icon: <GitHubIcon />,
    },
  ]

  const handleCopyToClipboard = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault() // Prevent navigation to `mailto`
    try {
      setIsLoading(true)
      await navigator.clipboard.writeText(email)
      showSuccessMsg('Email copied')
    } catch (err) {
      // // console.log(err)
      showErrorMsg(`Couldn't copy email`)
    } finally {
      setIsLoading(false)
    }
  }

  const openLink = (link: string) => {
    window.open(link)
  }

  const call = () => {
    window.location.href = `tel:${phone}`
  }

  return (
    <footer
      className={`app-footer full ${prefs.isDarkMode ? 'dark-mode' : ''}`}
    >
      <div className='contact-container'>
        {/* <div className='method-container address' onClick={navigateToAbout}>
          <PlaceIcon />
          <div className='address-container'>
            <span>{address}</span>
          </div>
        </div> */}
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
        {socials.map((social, idx) => {
          return (
            <div
              className={`social-container ${social.platform}-container`}
              key={`${social.platform}-${idx}`}
              onClick={() => {
                openLink(social.link)
              }}
            >
              {social.icon}
            </div>
          )
        })}
      </div>

      {/* <span>
        {rights} &copy; {new Date().getFullYear()}
      </span> */}
    </footer>
  )
}
