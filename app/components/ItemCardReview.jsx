"use client"
import { disconnectItemFromOrder, publishOrder, publishProduct, publishReview, removeOrder, reviewProduct } from "@/lib";
import Image from "next/image"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactStars from 'react-rating-star-with-type';


const ItemCardReview = ({ product, userId, orderId, itemId, isFirstRender, isLastItem }) => { //TODO: Finish
  const [star, setStar] = useState(0);
  const [isRated, setIsRated] = useState(false);
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if(isFirstRender) {
      const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
      if(isDarkModeLocal) document.body.classList.add('dark');
      else document.body.classList.remove('dark');
      console.log("rendered darkMode")
    }
  }, []);
  const onStarChange = (nextValue) => {
    setIsRated(true);
    setStar(nextValue);
  }
  const submitProductReview = async () => {
    if(!isRated) {
      setIsError(true);
      setTimeout(function () {
        setIsError(false);
      }, 3000);
      return
    }
    setIsError(false);
    setIsLoading(true);
    const reviewedProduct = await reviewProduct({productId: product.id, headline, content, rating: star, userId});
    await publishProduct(product.id);
    await publishReview(reviewedProduct.updateProduct.reviews[reviewedProduct.updateProduct.reviews.length - 1].id);
    await disconnectItemFromOrder({orderId, itemId});
    if(isLastItem) await removeOrder(orderId);
    await publishOrder(orderId);
    router.refresh();
    setIsLoading(false);
  }

  return (
    <div className="bgColorGray rounded-md pb-2 w-full lg:flex ">
      <div className="relative shadow-lg overflow-hidden rounded-lg h-[200px] sm:w-1/2 md:w-1/3 lg:w-1/4">
        <Image width={100} height={100} className="h-full w-full object-cover" src={product.imageUrls[0].url} alt={product.name}/>
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/40 flex justify-center items-center flex-col text-white">
          <h1>{product.name}</h1>
          {/* <ReactStars 
            count={5}
            value={star}
            // edit={true}
            activeColors={[ "red", "orange", "#FFCE00", "#4bc4d9","#4bc0d9",]}
            size={24}
            // isEdit={true}  
          /> */}
        </div>
      </div>
      <div className="w-full flex flex-col gap-2 mt-2 px-2 colorScheme fontColor ">
        <div className="flex text-lg justify-center items-center ">
          <ReactStars 
            count={5}
            onChange={onStarChange} 
            value={star}
            edit={true}
            isHalf={true}
            isEdit={true}
            activeColors={[ "red", "orange", "#FFCE00", "#4bc4d9","#4bc0d9",]}
            size={24}
          />
          {star}
        </div>
        <label className="flex flex-col " htmlFor="headline">
          Headline
          <input onChange={(e) => setHeadline(e.target.value)} value={headline} type="text" id="headline" className="rounded-lg px-2 py-1 " />
        </label>
        <label className="flex flex-col " htmlFor="comment">
          Comment
          <textarea onChange={(e) => setContent(e.target.value)} value={content} type="text" id="comment" className="rounded-lg px-2 py-1 " />
        </label>
        <button disabled={isLoading} onClick={submitProductReview} className="bgColor rounded-lg py-1 px-2 hover:bg-[#4bc0d9] ">{isError ? "Please Rate before submiting" : "Submit"}</button>
      </div>
    </div>
  )
}

export default ItemCardReview