export interface LoginResponse {
  success: boolean
  message: string
  user?: {
    id: string
    fullName: string
    email: string
    whoAreYou: string
    companyTitle: string
    activity: string[]
  }
  token?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface LoginFormProps {
  onLogin: (formData: LoginFormData) => Promise<void>
  isLoading: boolean
  apiError: string
  onClearError: () => void
}

export interface SuccessPageProps {
  successMessage: string
  onLoginAgain: () => void
}