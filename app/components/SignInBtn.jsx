"use client"
import { signIn } from 'next-auth/react'

const SignInBtn = () => {
  return (
    <div className='pb-20'>
      <button onClick={signIn} className="w-[343px] h-[50px] px-4 py-2 opBgColor opTxtColor rounded-lg border-black justify-around items-center gap-[3px] flex">
        <div className=" text-center text-[23px] font-semibold flex items-center gap-4">
          <h2>SignIn</h2>
        </div>
      </button>
    </div>
  )
}

export default SignInBtn