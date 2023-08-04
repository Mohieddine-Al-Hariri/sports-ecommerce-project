"use client"
import Link from "next/link"

const Navbar = ({ userSlug }) => {

  return (
    <div className="w-full flex items-center justify-center px-10 fixed bottom-5">
      <div className="w-[248px] h-6 flex items-center justify-between ">
      <Link href="/" className="rounded-full text-[#8f8f8f] hover:bg-[#8f8f8f] hover:text-[#f3f3f3] p-2  ">
        <svg width="24px" height="24px" viewBox="0 0 0.72 0.72" fill="none" xmlns="http://www.w3.org/2000/  svg"><path d="M0.15 0.21h0.414a0.06 0.06 0 0 1 0.06 0.066l-0.018 0.18A0.06 0.06 0 0 1 0.546 0.51H0.259a0.06 0.06 0 0 1 -0.059 -0.048L0.15 0.21Z" stroke="currentColor" strokeWidth="0.06" strokeLinejoin="round"/><path d="m0.15 0.21 -0.024 -0.097A0.03 0.03 0 0 0 0.097 0.09H0.06" stroke="currentColor" strokeWidth="0.06" strokeLinecap="round" strokeLinejoin="round"/><path d="M0.24 0.63h0.06" stroke="currentColor" strokeWidth="0.06" strokeLinecap="round" strokeLinejoin="round"/><path d="M0.48 0.63h0.06" stroke="currentColor" strokeWidth="0.06" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </Link>
      <Link href="/" className="rounded-full text-[#8f8f8f] hover:bg-[#8f8f8f] hover:text-[#f3f3f3] p-2  "><svg width="24px" height="24px" viewBox="0 0 0.563 0.563" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m0.281 0.019 0.012 -0.014a0.019 0.019 0 0 0 -0.024 0L0.281 0.019Zm-0.263 0.225 -0.012 -0.014L0 0.235v0.009h0.019Zm0.188 0.3v0.019a0.019 0.019 0 0 0 0.019 -0.019h-0.019Zm0.15 0H0.337a0.019 0.019 0 0 0 0.019 0.019v-0.019Zm0.188 -0.3h0.019v-0.009l-0.007 -0.006 -0.012 0.014ZM0.056 0.563h0.15v-0.037h-0.15v0.037Zm0.5 -0.333 -0.263 -0.225 -0.024 0.028 0.263 0.225 0.024 -0.028Zm-0.287 -0.225 -0.263 0.225 0.024 0.028 0.263 -0.225 -0.024 -0.028ZM0.225 0.544v-0.112H0.188v0.112h0.037Zm0.112 -0.112v0.112h0.037v-0.112H0.337Zm0.019 0.131h0.15v-0.037h-0.15v0.037Zm0.206 -0.056v-0.263h-0.037v0.263h0.037Zm-0.563 -0.263v0.263h0.037v-0.263H0ZM0.281 0.375A0.056 0.056 0 0 1 0.337 0.431h0.037A0.094 0.094 0 0 0 0.281 0.337v0.037Zm0 -0.037A0.094 0.094 0 0 0 0.188 0.431h0.037A0.056 0.056 0 0 1 0.281 0.375V0.337Zm0.225 0.225a0.056 0.056 0 0 0 0.056 -0.056h-0.037a0.019 0.019 0 0 1 -0.019 0.019v0.037Zm-0.45 -0.037a0.019 0.019 0 0 1 -0.019 -0.019H0A0.056 0.056 0 0 0 0.056 0.563v-0.037Z" fill="currentColor"/></svg></Link>
      <Link href={userSlug? "/userProfile" : "/SignIn"} className="rounded-full text-[#8f8f8f] hover:bg-[#8f8f8f] hover:text-[#f3f3f3] p-2 ">
        <svg width="24px" height="24px" viewBox="0 0 0.72 0.72" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="style=stroke"><g id="profile"><path id="vector (Stroke)" fillRule="evenodd" clipRule="evenodd" d="M0.36 0.082a0.112 0.112 0 1 0 0 0.225 0.112 0.112 0 0 0 0 -0.225ZM0.202 0.195a0.158 0.158 0 1 1 0.315 0 0.158 0.158 0 0 1 -0.315 0Z" fill="currentColor"/><path id="rec (Stroke)" fillRule="evenodd" clipRule="evenodd" d="M0.128 0.557a0.16 0.16 0 0 1 0.16 -0.16h0.146a0.16 0.16 0 0 1 0.16 0.16 0.125 0.125 0 0 1 -0.125 0.125H0.253a0.125 0.125 0 0 1 -0.125 -0.125Zm0.16 -0.115a0.115 0.115 0 0 0 -0.115 0.115c0 0.044 0.036 0.08 0.08 0.08h0.214c0.044 0 0.08 -0.036 0.08 -0.08 0 -0.063 -0.051 -0.115 -0.115 -0.115H0.287Z" fill="currentColor"/></g></g></svg>
      </Link>
      </div>
    </div>
  )
}

export default Navbar