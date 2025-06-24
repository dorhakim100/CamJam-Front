export interface User {
  id: string

  fullname: string

  email: string

  password?: string
  imgUrl?: string
  isGuest?: boolean
}
