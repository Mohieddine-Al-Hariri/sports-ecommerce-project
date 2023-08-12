"use client"
import Image from "next/image"
import LocationInput from "./LocationInput";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { publishUser, updateTheUser } from "@/lib";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";
import { storage } from "@/lib/firebaseConfig";
import { Order } from ".";


const ProfilePage = ({ user, orders }) => { 
  const { firstName, lastName, email, phoneNumber, birthDate, orderItems, profileImageUrl, location } = user;
  const [selectedLocation, setSelectedLocation] = useState(location || '');
  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUpload, setImageUpload] = useState(null);
  console.log("orders: ", orders);
  console.log("user: ", user);
  const [updatedUserDetails, setUpdatedUserDetails] = useState({firstName, lastName, email, phoneNumber, profileImageUrl});
  //TODO: Continue Styling, add getTheUser, fix image alt...


  const uploadImage = async (imagePath) => { //To add the new profile image to the database
    if (imagePath == null || !imagePath) {
      return ({ message: "Image path is required" }, { status: 400 });
    }
    const imageRef = ref(storage, `profileImages/${imagePath.name + v4()}`); 
    const imageUrl = await uploadBytes(imageRef, imagePath).then( async (snapshot) => {
      const downloadUrl = await getDownloadURL(snapshot.ref).then((url) => {
        return url
      });
      return downloadUrl
    });
    return imageUrl
  };
  const deletePrevImage = async (prevImgUrl) => { //To remove the old profile Image from the database
    const imageRef = ref(storage, prevImgUrl);
    try {
      await deleteObject(imageRef).catch((error) => {
        console.log(error.message);
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  const handleSubmitProfileEdits = async () => { //TODO: FIX
    setIsSaving(true);
    if(profileImageUrl){
      await deletePrevImage(profileImageUrl);
    }
    const imgUrl = await uploadImage(imageUpload);
    await updateTheUser({...updatedUserDetails, location: selectedLocation, userId: user.id, imgUrl});
    await publishUser(user.slug);
    setIsSaving(false);
    setIsEdit(false);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };
  const handleChangeImage = (e) => {
    e.preventDefault();

    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.includes('image')) {
      alert('Please upload an image!');

      return;
    }
    setImageUpload(file);

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      const result = reader.result;

      // handleStateChange("image", result)
      setUpdatedUserDetails({ ...updatedUserDetails, profileImageUrl: result });
    };
  };

  if(isEdit)
    return (
      <div className="bg-white h-screen flex flex-col justify-start items-center gap-5 ">
        <div className="w-full h-fit flex justify-between p-6 text-black">
          <button onClick={() => setIsEdit(false)} className="w-[19.78px] relative ">
            <svg
              width="30px"
              height="30px"
              viewBox="0 0 0.9 0.9"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <title>{"back_line"}</title>
              <g
                id="\u9875\u9762-1"
                stroke="none"
                strokeWidth={1}
                fill="none"
                fillRule="evenodd"
              >
                <g id="Arrow" transform="translate(-240)">
                  <g id="back_line" transform="translate(240)">
                    <path
                      d="M0.9 0v0.9H0V0h0.9ZM0.472 0.872l0 0 -0.003 0.001 -0.001 0 -0.001 0 -0.003 -0.001c0 0 -0.001 0 -0.001 0l0 0 -0.001 0.016 0 0.001 0 0 0.004 0.003 0.001 0 0 0 0.004 -0.003 0 -0.001 0 -0.001 -0.001 -0.016c0 0 0 -0.001 -0.001 -0.001Zm0.01 -0.004 0 0 -0.007 0.003 0 0 0 0 0.001 0.016 0 0 0 0 0.008 0.003c0 0 0.001 0 0.001 0l0 -0.001 -0.001 -0.023c0 0 0 -0.001 -0.001 -0.001Zm-0.027 0a0.001 0.001 0 0 0 -0.001 0l0 0.001 -0.001 0.023c0 0 0 0.001 0.001 0.001l0.001 0 0.008 -0.003 0 0 0 0 0.001 -0.016 0 0 0 0 -0.007 -0.003Z"
                      id="MingCute"
                      fillRule="nonzero"
                    />
                    <path
                      d="M0.115 0.211A0.037 0.037 0 0 1 0.15 0.188h0.375a0.263 0.263 0 1 1 0 0.525H0.188a0.037 0.037 0 1 1 0 -0.075h0.337a0.188 0.188 0 1 0 0 -0.375H0.241l0.067 0.067a0.037 0.037 0 0 1 -0.053 0.053l-0.131 -0.131a0.037 0.037 0 0 1 -0.008 -0.041Z"
                      id="\u8DEF\u5F84"
                      fill="#09244B"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </button>
          {isSaving?
            <div role="status">
              <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <span className="sr-only">Loading...</span>
            </div>:
            <button onClick={handleSubmitProfileEdits}>
              <svg fill="currentColor" width="30px" height="30px" viewBox="0 0 0.9 0.9" xmlns="http://www.w3.org/2000/svg"><path d="M0.327 0.289 0.412 0.203V0.563a0.037 0.037 0 0 0 0.075 0V0.203l0.086 0.086a0.037 0.037 0 0 0 0.053 0 0.037 0.037 0 0 0 0 -0.053l-0.15 -0.15a0.037 0.037 0 0 0 -0.012 -0.008 0.037 0.037 0 0 0 -0.028 0 0.037 0.037 0 0 0 -0.012 0.008l-0.15 0.15a0.037 0.037 0 1 0 0.053 0.053ZM0.787 0.45a0.037 0.037 0 0 0 -0.037 0.037v0.225a0.037 0.037 0 0 1 -0.037 0.037H0.188a0.037 0.037 0 0 1 -0.037 -0.037v-0.225a0.037 0.037 0 0 0 -0.075 0v0.225a0.112 0.112 0 0 0 0.112 0.112h0.525a0.112 0.112 0 0 0 0.112 -0.112v-0.225a0.037 0.037 0 0 0 -0.037 -0.037Z"/></svg>
            </button>
          }
        </div>
        <div className="flexCenter flex-col form_image-container rounded-full ">
          {!updatedUserDetails.profileImageUrl && (
            <label htmlFor="poster" className="flexCenter form_image-label fontColor absolute">
              Choose a Profile Image
            </label>
          )}
          <div className="flexCenter bg-gray-500 rounded-full aspect-square overflow-hidden p-4 w-[167px] h-[167px] ">
            <input
              id="image"
              type="file"
              accept="image/*"
              // required={type === "create" ? true : false}
              className="form_image-input "
              onChange={(e) => handleChangeImage(e)}
            />
            {updatedUserDetails.profileImageUrl && (
              <div className="rounded-full aspect-square w-[167px] h-[167px]">
                <Image
                  src={updatedUserDetails?.profileImageUrl}
                  className=" object-cover z-20 rounded-full w-[167px] h-[167px] aspect-square md:inline-block"
                  alt="image"
                  // fill
                  width={167}
                  height={167}
                />
              </div>
              
            )}
          </div>
        </div>
        <div className="text-black text-sm font-bold text-center ">
          <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md flex gap-2 ">
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={updatedUserDetails.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={updatedUserDetails.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
              />

            </div>
          </div>
          {location ? <h2>{location}</h2>
          : 
            <LocationInput selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />
          }
          {/* {selectedLocation && (
            <p className="mt-4">
              Selected Location: {selectedLocation}
            </p>
          )} */}
          
        </div>
        <div className="w-full h-full border-solid border-t-2 border-[#8f8f8f] fontColor ">
          <h1 className="p-2 text-xl font-semibold ">Orders</h1>
          {orders?.map((order) => (
            <Order order={order.node} />
          ))}
        </div>
      </div>
    );
  return (
    <div className="bg-white h-screen flex flex-col justify-start items-center gap-5 ">
      <div className="w-full h-fit flex justify-between p-6">
        <button onClick={signOut} className="w-[19.78px] relative fontColor ">
          <svg width="30px" height="30px" viewBox="0 0 1.8 1.8" fill="none" xmlns="http://www.w3.org/2000/svg"><path width="48" height="48" fill="white" fillOpacity="0.01" d="M0 0H1.8V1.8H0V0z"/><path d="M0.9 0.225H0.225v1.35h0.675" stroke="currentColor" strokeWidth="0.15" strokeLinecap="round" strokeLinejoin="round"/><path d="m1.238 1.238 0.337 -0.337 -0.337 -0.337" stroke="currentColor" strokeWidth="0.15" strokeLinecap="round" strokeLinejoin="round"/><path d="M0.6 0.9h0.975" stroke="currentColor" strokeWidth="0.15" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button onClick={() => setIsEdit(!isEdit)}>
          <svg width="30px" height="30px" viewBox="0 0 0.9 0.9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.611 0.086a0.038 0.038 0 0 1 0.053 0l0.15 0.15a0.038 0.038 0 0 1 0 0.053l-0.488 0.488a0.038 0.038 0 0 1 -0.026 0.011H0.15A0.038 0.038 0 0 1 0.112 0.75V0.6A0.038 0.038 0 0 1 0.123 0.574L0.498 0.198 0.611 0.086zM0.525 0.278 0.187 0.615v0.097h0.097L0.622 0.375 0.525 0.278zm0.15 0.044L0.735 0.262 0.638 0.165 0.578 0.225l0.098 0.098z" fill="#0D0D0D"/></svg>
        </button>
      </div>
      <Image src={profileImageUrl || "/Ellipse 32.png"} width={167} height={167} className="w-[167px] h-[167px] rounded-full" alt="profileImg"/>
      <div className="text-black text-sm font-bold text-center ">
        <h1>{firstName} {lastName}</h1>
        <h2>{phoneNumber}</h2>
        <h2>{email}</h2>
        <h2 >Location: {location}</h2>
        <h2 >BirthDate: {birthDate}</h2>
      </div>
      <div className="w-full h-full border-solid border-t-2 border-[#8f8f8f] fontColor p-1 ">
        <h1 className="p-2 text-xl font-semibold ">Orders</h1>
        {orders?.map((order) => ( 
          <Order key={order.node.id} order={order.node} />
        ))}
      </div>
    </div>
  )
}

export default ProfilePage