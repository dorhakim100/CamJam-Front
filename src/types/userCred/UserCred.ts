export interface UserCred {
  email: string

  password: string
  validatePassword?: string
  fullname?: string
  imgUrl?: string
  isRemember?: boolean
  isGuest?: boolean
}
