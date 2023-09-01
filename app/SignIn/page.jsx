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
    <div className=' flex overflow-y-scroll max-lg:items-start justify-center items-start max-sm:fixed max-sm:-top-2 h-full w-full text-white gap-2 bg-white pb-10 max-lg:pt-0 max-sm:py-10'>
      <CredentialsForm />
    </div>
  )
}

export default signIn
