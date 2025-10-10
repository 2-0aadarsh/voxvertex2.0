import { NextRequest, NextResponse } from 'next/server'

// Mock user database (copy from login route)
const mockUsers = [
  {
    id: 'user_1',
    fullName: 'Maxwell',
    email: 'maxwell@example.com',
    password: 'password123', 
    whoAreYou: 'speaker',
    companyTitle: 'technology',
    activity: ['Software Development', 'AI/Machine Learning', 'Web Development']
  },
  {
    id: 'user_2',
    fullName: 'Benett Down',
    email: 'benett@example.com',
    password: 'password123',
    whoAreYou: 'organizer',
    companyTitle: 'healthcare',
    activity: ['Healthcare Management', 'Medical Research', 'Patient Care']
  },
  {
    id: 'user_3',
    fullName: 'Riya',
    email: 'riyal1234@gmail.com',
    password: 'password123',
    whoAreYou: 'participant',
    companyTitle: 'business',
    activity: ['Project Management', 'Business Strategy', 'Team Leadership']
  }
]

export async function GET(request: NextRequest) {
  // Get the credentials from the query parameters for easy debugging
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')
  const password = searchParams.get('password')

  // Debug info
  const debug = {
    providedCredentials: {
      email,
      password,
    },
    mockUsers: mockUsers.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      password: user.password, // Only showing in debug API
    })),
    emailMatches: email 
      ? mockUsers.map(user => ({
          email: user.email,
          matchesExact: user.email === email,
          matchesLowerCase: user.email.toLowerCase() === email.toLowerCase(),
        }))
      : [],
    passwordMatches: password
      ? mockUsers.map(user => ({
          email: user.email,
          passwordMatch: user.password === password,
        }))
      : []
  }

  return NextResponse.json(debug)
}
