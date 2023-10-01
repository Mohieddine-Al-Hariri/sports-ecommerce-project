"use client"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import { FacebookSignInButton, GoogleSignInButton } from "./authButton";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import OtpInput from "react-otp-input";
import PhoneInput from "react-phone-input-2";
import { toast, Toaster } from "react-hot-toast";
import "react-phone-input-2/lib/style.css";
import { CgSpinner } from "react-icons/cg";
import Image from "next/image";


const CredentialsForm = ({ isModal }) => {
	const [error, setError] = useState("");
	// const [countryCode, setCountryCode] = useState("");
	const [dateState, setDateState] = useState('');
	const [isLogIn, setIsLogIn] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [isVerifyByPhoneNumber, setIsVerifyByPhoneNumber] = useState(false);
	const [ph, setPh] = useState("");
	const [otp, setOtp] = useState("");
	const [showOTP, setShowOTP] = useState(false);
	const [user, setUser] = useState(null);
	const [formData, setFromData] = useState({firstName: "", lastName: "", password: "", });
  // const [rememberMe, setRememberMe] = useState(false);
	const router = useRouter();

	function onCaptchVerify() {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            // onSignup();
          },
          "expired-callback": () => {},
        },
			);
		}
	}

	const handleSubmit = async () => { 
    const {firstName, lastName, password} = formData
		const signInResponse = await signIn("credentials", {
			redirect: false,
			callbackUrl: "/",
			ph: ph,
			password: password,
			firstName: firstName,
			lastName: lastName,
			isLogIn: isLogIn,
			birthDate: dateState
		});
    console.log(signInResponse)
		if (signInResponse && !signInResponse.error) {
      // if(rememberMe){
      //   const userData = {firstName, lastName, phoneNumber: ph};
      //   localStorage.setItem("user", JSON.stringify(userData));
      // }
			router.push("/");
		}else{
			console.log("Error", signInResponse);
			setError(signInResponse.error);
		}
	}
	function onSignup(e) {
		e.preventDefault();
    
    if(isLogIn && (!ph || !formData.password)) return setError("All fields are required");
    else if(!ph ||!formData.firstName || !formData.lastName || !formData.password) return setError("All fields are required");
		
    setLoading(true);
		onCaptchVerify();
	
		const appVerifier = window.recaptchaVerifier;
		const formatPh = "+" + ph;
	
		signInWithPhoneNumber(auth, formatPh, appVerifier)
		  .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOTP(true);
        toast.success("OTP sended successfully!");
		  })
		  .catch((error) => {
        console.log(error);
        setLoading(false);
		  });
	  }
	  function onOTPVerify() {
		setLoading(true);
		window.confirmationResult
		  .confirm(otp)
		  .then(async (res) => {
			console.log(res);
			setUser(res.user);
			handleSubmit();
			setLoading(false);
		  })
		  .catch((err) => {
			console.log(err);
			setLoading(false);
    });
  }
  return (
    <div className="container">
      {showOTP ? (
        <div className=" h-screen flex flex-col justify-center items-center px-2 ">
          <div className="w-full flex"><button onClick={() => setShowOTP(false)} className=" text-blue-500 underline ">Return to info</button></div>
          
          <h1 className="text-black">An SMS should be sent to the phone number you provided.</h1>
          
          <div className="bg-white text-[#4bc0d9] w-fit h-fit mx-auto p-4 rounded-full">
            <BsFillShieldLockFill size={30} />
          </div>
          <label
            htmlFor="otp"
            className="font-bold text-xl text-black text-center"
          >
            Enter your Code
          </label>
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            otpType="number"
            disabled={false}
            autoFocus
            renderSeparator={<span> </span>}
            containerStyle = "opt-container rounded-md w-[250px] h-[60px] flex justify-around text-[#4bc0d9] bg-[#4bc0d9] border-[#4bc0d9] border-2 p-2 mb-4"
            inputStyle="rounded w-[18px] h-[28px]"
            renderInput={(props) => <input {...props} />}
          ></OtpInput>
          <button
            onClick={onOTPVerify}
            className="bg-[#4bc0d9] hover:bg-[#3ca8d0] w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
          >
            {loading && (
              <CgSpinner size={20} className="mt-1 animate-spin" />
            )}
            <span>Verify OTP</span>
          </button>
          <div className=" text-black">
            <div className=" ">Didn't reveive code? <button onClick={() => signInWithPhoneNumber(auth, "+" + ph, window.recaptchaVerifier)} className="text-blue-500 font-semibold ">Resend</button></div>
          </div>
        </div>
      ):(
        <div className="login__content ">
          {/* <Image fill src="/login-bg-2 .jpg" alt="login image" className="login__img"/> */}
          {/* <h1 className="bg-white rounded text-[#4bc0d9] font-bold text-2xl p-2 w-40 h-20 flex justify-center items-center relative ml-[4.5rem] ">ELECTRO M</h1> */}
          <Image fill src="/bg-login.png" alt="login image" className="login__img"/>
          <form onSubmit={(e) => onSignup(e)} className="login__form overflow-y-scroll max-h-[650px] max-sm:pb-28">
            <div>
              <h1 className="login__title">
                {isLogIn 
                  ? (<><span>Welcome</span> to the family</>) 
                  : (<><span>Welcome</span> Back</>)
                }
                {/* <span>Welcome</span> Back */}
              </h1>
              <p className="login__description">
              {!isLogIn 
                ? "Hello! Please Sign up to continue."
                : "Welcome! Please Log in to continue."
              }
              </p>
            </div>
                
            <div>
            <GoogleSignInButton />
            {/* <FacebookSignInButton/> */}
              <h2 className="text-center mt-1 ">OR</h2>
              <div className="login__inputs">

                <div>
                  <label htmlFor="phone number" className="login__label">Phone Number</label>
                  <PhoneInput 
                    className="border-black text-black border-solid" containerStyle={{ width: "100%", borderRadius: "0.5rem" }} 
                    inputStyle={{ fontSize: "0.813rem", width: "100%", backgroundColor: "hsla(244, 16%, 92%, .6)", border:"hsl(208, 4%, 36%) solid 2px", borderLeft: "none", padding:"14px 12px 14px 42px ", height:"57px" }} 
                    buttonStyle={{backgroundColor: "hsla(244, 16%, 92%, .6)", color: "hsl(208, 4%, 36%)", border:"hsl(208, 4%, 36%) solid 2px ", borderRight: "none", padding:"0px 0px 0px 0px ", height:"57px" }}
                    // inputClass={"border-[2.5px] text-black p-1 w-full text-[0.813rem] border-[hsl(208, 4%, 36%)] "} 
                    country={"lb"} value={ph} onChange={setPh} 
                  />
                </div>
                {!isLogIn && (
                  <>
                    <div>
                      <label htmlFor="first name" className="login__label">FirstName</label>
                      <input value={formData.firstName} onChange={(e) => setFromData({...formData, firstName: e.target.value})} id="first name" type="text" placeholder="Enter your first name" required className="login__input"/>
                    </div>
                    <div>
                      <label htmlFor="last name" className="login__label">LastName</label>
                      <input value={formData.lastName} onChange={(e) => setFromData({...formData, lastName: e.target.value})} id="last name" type="text" placeholder="Enter your last name" required className="login__input"/>
                    </div>
                    <div>
                      <label htmlFor="birthdate" className="login__label">Birthdate</label>
                      <input value={dateState} onChange={(e) => setDateState(e.target.value)} id="birthdate" type="date" required className="login__input"/>
                    </div>
                  </>
                )}

              <div>
                <label htmlFor="input-pass" className="login__label">Password</label>

                <div className="login__box">
                  <input value={formData.password} onChange={(e) => setFromData({...formData, password: e.target.value})} type="password" placeholder="Enter your password" required className="login__input" id="input-pass"/>
                  <i className="ri-eye-off-line login__eye" id="input-icon"></i>
                </div>
              </div>
            </div>

            {/* <div className="login__check">
              <input onChange={() => setRememberMe(prev => !prev)} checked={rememberMe} id="remember me" type="checkbox" className="login__check-input"/>
              <label htmlFor="remember me" className="login__check-label">Remember me</label>
            </div> */}
          </div>

          <div>
            <div className="login__buttons">
              {isLogIn 
                ? <button type="sumbit" className="login__button">Log In</button>
                : <button type="sumbit" className="login__button login__button-ghost">Sign Up</button>
              }
            </div>
            <div className="flex flex-col text-left gap-1">
              <button onClick={(e) => {e.preventDefault(); setIsLogIn(prev => !prev)}} className="login__forgot text-left">
                {isLogIn ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </button>
              <button onClick={() => router.push("/")} className="login__forgot text-left">Cancel</button>
            </div>

          </div>
        </form>
        </div>
      )}
    <div id="recaptcha-container"></div>
  </div>
  )

}

export default CredentialsForm