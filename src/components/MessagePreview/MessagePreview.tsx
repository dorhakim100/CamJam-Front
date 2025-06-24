// import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export function MessagePreview({ message }: { message: any }) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <>
      <span
        className={`user-name ${message.user.isMe ? 'me' : ''} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        {message.user.isMe ? 'You' : message.user.fullname || 'Unknown User'}
      </span>
      <li
        key={message._id}
        className={`message-container ${message.user.isMe ? 'me' : ''} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        {/* <span className='user-name'>
          {message.isMe ? 'You' : message.username || 'Unknown User'}
        </span> */}
        <img className='user-image' src={message.user.imgUrl} alt='user' />
        <span className='message-text'>{message.content}</span>
        <span className='time'>
          {new Date(message.sentAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </span>
        {/* {message.user.isMe && ( in the future add edit and delete
          <MessageOptions
            onEdit={() => {
              console.log('edit')
            }}
            onDelete={() => {
              console.log('delete')
            }}
          />
        )} */}
      </li>
    </>
  )
}

// interface MessageOptionsProps {
//   onEdit: () => void
//   onDelete: () => void
// }

// export const MessageOptions: React.FC<MessageOptionsProps> = ({
//   onEdit,
//   onDelete,
// }) => {
//   return (
//     <div className='message-options'>
//       <IconButton>
//         <ModeEditIcon />
//       </IconButton>
//       <IconButton>
//         <DeleteIcon />
//       </IconButton>
//     </div>
//   )
// }
