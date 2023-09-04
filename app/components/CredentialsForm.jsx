"use client"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react"
import { FacebookSignInButton, GoogleSignInButton } from "./authButton";
import { RecaptchaVerifier, signInWithPhoneNumber, settings } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { BsFillShieldLockFill, BsTelephoneFill } from "react-icons/bs";
import OtpInput from "otp-input-react";
import PhoneInput from "react-phone-input-2";
import { toast, Toaster } from "react-hot-toast";
import "react-phone-input-2/lib/style.css";
import { CgSpinner } from "react-icons/cg";


const CredentialsForm = ({ isModal }) => {
	const [error, setError] = useState(null);
	// const [countryCode, setCountryCode] = useState("");
	const [dateState, setDateState] = useState('');
	const [isLogIn, setIsLogIn] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [isVerifyByPhoneNumber, setIsVerifyByPhoneNumber] = useState(false);
	const [ph, setPh] = useState("");
	const [otp, setOtp] = useState("");
	const [showOTP, setShowOTP] = useState(false);
	const [user, setUser] = useState(null);
	const [formData, setFromData] = useState({firstName: "", lastName: "", password: "", })
	const router = useRouter();

	function onCaptchVerify() { //TODO: Fix Phone Auth
    // Turn off phone auth app verification.
    // auth.settings.appVerificationDisabledForTesting = false; //didnt work
		if (!window.recaptchaVerifier) {
			window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            onSignup();
          },
          "expired-callback": () => {},
        },
        auth
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
		if (signInResponse && !signInResponse.error) {
			router.push("/");
		}else{
			console.log("Error", signInResponse);
			setError(signInResponse.error);
		}
	}
	function onSignup(e) {
		e.preventDefault();
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
		<div className={`${isModal ? "bg-transparent": "bg-white"} shadow-lg rounded-lg p-8 py-0 max-sm:p-4 mb-8 `}>
      <h1 className="text-3xl text-center text-black  mb-2 max-sm:mt-4">{isLogIn ? "Log In" : "Sign Up"}</h1>
			<Toaster toastOptions={{ duration: 4000 }} />
      <div id="recaptcha-container"></div>
      {showOTP ? (
          <div className=" h-screen flex flex-col justify-center">
            <div className="bg-white text-blue-500 w-fit h-fit mx-auto p-4 rounded-full">
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
              OTPLength={6}
              otpType="number"
              disabled={false}
              autoFocus
              className="opt-container text-blue-500 bg-blue-500 border-blue-500 border-2 pl-2 py-2 mb-4"
            ></OtpInput>
            <button
              onClick={onOTPVerify}
              className="bg-blue-600 hover:bg-blue-700 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
            >
              {loading && (
                <CgSpinner size={20} className="mt-1 animate-spin" />
              )}
              <span>Verify OTP</span>
            </button>
          </div>
        ):(
			<div className="flex flex-col gap-8 max-sm:gap-4 w-full max-w-lg p-10 max-sm:p-4 bg-gray-200 rounded-lg border border-gray-200 shadow-md">
				<GoogleSignInButton />
				<FacebookSignInButton/>
				<h1 className="text-black text-center">OR</h1>
				<form onSubmit={onSignup} className="flex flex-col gap-8 max-sm:gap-4 w-full max-w-lg ">
					{/* <h1 className=" text-xl w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500">+{ph}</h1> */}
					<>
						<div className="bg-white text-blue-500 w-fit mx-auto p-4 rounded-full">
						<BsTelephoneFill size={30} />
						</div>
						<PhoneInput className="text-black" country={"lb"} value={ph} onChange={setPh} />
						{/* <button
							onClick={onSignup}
							className="bg-emerald-600 w-full flex gap-1 items-center justify-center py-2.5 text-white rounded"
						>
							{loading && (
								<CgSpinner size={20} className="mt-1 animate-spin" />
							)}
							<span>Send code via SMS</span>
						</button> */}
					</>
					{
						!isLogIn && 
						<div className="flex flex-col gap-8 max-sm:gap-4">
							<input value={formData.firstName} onChange={(e) => setFromData(prev => ({...prev, firstName: e.target.value}))} type="text" name="firstName" placeholder="First Name" required className=" w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500" />
							<input value={formData.lastName} onChange={(e) => setFromData(prev => ({...prev, lastName: e.target.value}))} type="text" name="lastName" placeholder="Last Name" required className=" w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500" />
						</div>
					}
					<input className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500" type="date" max={new Date().toISOString().split('T')[0]}  value={dateState} onChange={(e) => setDateState(e.target.value)} placeholder="19.08.23"/>
					<input value={formData.password} onChange={(e) => setFromData(prev => ({...prev, password: e.target.value}))} type="password" name="password" placeholder="Password" required className=" w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500" />
					<button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">Sign In with Phone Number</button>
					{error && <p className="text-red-500">{error}</p>}
				</form>
				<button onClick={() => setIsLogIn(!isLogIn)} ><h1 className="text-center text-blue-400 underline -m-2">{isLogIn ? "Don't have an account? Sign-Up here" : "Already have an account? Login here"}</h1></button>
				<button onClick={() => history.back()} ><h1 className="text-center text-blue-400 underline -m-2">Cancel</h1></button>
			</div>)}
		</div>
	)
}

export default CredentialsForm