import React from 'react'
import { SocketUser } from '../../services/socket.service'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

export function MembersList({ members }: { members: SocketUser[] }) {
  console.log('members', members)

  const room = useSelector(
    (stateSelector: RootState) => stateSelector.roomModule.room
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div
      className={`members-list-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <ul>
        {members.map((member) => {
          return (
            <li
              key={member.id}
              className={`member ${room.host_id === member.id ? 'host' : ''} ${
                user?.id === member.id ? 'logged-user' : ''
              }`}
            >
              <img
                src={member.imgUrl || '/assets/img/user.png'}
                alt={member.fullname}
                className='member-img'
              />
              <span className='member-name'>{member.fullname}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
