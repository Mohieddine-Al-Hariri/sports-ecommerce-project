import { redirect } from "next/navigation"
import { getCsrfToken } from "next-auth/react"
import { CredentialsForm } from "../components"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../lib/auth"

const signIn = async () => {
  const session = await getServerSession(authOptions)
  if (session) {
    redirect("/")
  }
  return ( //TODO: Fix Responsiveness
    <div className=' flex max-lg:items-start justify-center items-start max-sm:fixed max-sm:-top-2 h-full text-white gap-2 bg-white  pb-10 max-lg:pt-0 max-sm:py-10'>
      <CredentialsForm />
    </div>
  )
}
//TODO: Compare Given Phone Number and gmail/facebook to Check if user already exists

export default signIn
