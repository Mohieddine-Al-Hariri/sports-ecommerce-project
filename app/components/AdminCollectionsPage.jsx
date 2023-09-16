"use client";

import { deleteCollection, publishCollection, updateCollection, updateCollectionState } from "@/lib";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useRef } from "react";
import Image from "next/image";
import CreateCollectionForm from "./CreateCollectionForm";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebaseConfig";
import { v4 } from "uuid";
import { SVGCancel, SVGCheck, SVGLoading, SVGPencil, SVGTrash, SVGX } from ".";

export const ProductCard = ({ product, included, include, inputId }) => {
  return (
    <div className="flex flex-col items-center gap-2 w-[70px] group">
      <label
        className={`relative cursor-pointer ${
          included ? "border-[#4bc0d9]" : "border-gray-300 group-hover:border-[#3ca8d0]"
        } border-2 rounded-[10px] transition duration-300`}
        htmlFor={inputId}
      >
        <input
          className="hidden"
          type="checkbox"
          id={inputId}
          name="includeItem"
          onChange={() => include(included, {id: product.id, imageUrls: product.imageUrls, name: product.name} )}
          checked={included}
        />
        <Image
          width={60}
          height={87}
          className="w-[60px] h-[87px] rounded-[10px] transition duration-300"
          src={product.imageUrls[0].url}
          alt={product.name}
        />
        <div
          className={`absolute -top-4 left-4 ${
            included ? "bg-[#4bc0d9] group-hover:bg-[#3ca8d0] text-gray-100 " : "bg-white text-gray-600 "
          }  p-1 rounded-full shadow`}
        >
          {included ? "Included" : "Include"}
        </div>
      </label>
      <p className="text-center text-xs">{product.name}</p>
    </div>
  );
};

export const CollectionStateMenu = ({
  collectionState,
  setCollectionState,
  collectionId,
  isOpen,
  setIsOpen,
}) => {
  const router = useRouter();
  const states = ["Available", "Out_of_Stock", "Removed"];
  // Ref for the card menu container
  const cardMenuRef = useRef(null);

  // Handle click outside the card menu
  const handleClickOutside = (event) => {
    if (cardMenuRef.current && !cardMenuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  // Add click event listener when the component mounts
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const updateCollectionShowState = async (newState) => {
    const updatedCollection = await updateCollectionState({
      collectionId,
      state: newState,
    });
    setCollectionState(newState);
    //publishOrderItems && publishTheUser??
    setIsOpen(false);
    await publishCollection(collectionId);
    router.refresh();
  };
  return (
    <div
      ref={cardMenuRef}
      className={`absolute w-48 h-10 bgColorGray fontColor rounded-t-md right-2 -top-2 pt-1 pr-1 `}
    >
      <div>
        <div className="w-full flex justify-end">
          <button
            className="p-1 fontColorGray hover:text-gray-100 hover:bg-[#4bc0d9] rounded-full focus:outline-none"
            onClick={() => setIsOpen(!isOpen)} title="Close" 
          >
            <SVGX />
          </button>
        </div>

        <div className="absolute right-0 w-48 fontColor rounded-md shadow-lg z-10 bgColorGray">
          <ul>
            {states.map((state) => {
              return (
                <button
                  key={state}
                  disabled={state === collectionState}
                  onClick={() => updateCollectionShowState(state)}
                  className={`px-4 py-2 rounded-md hover:bg-[#4bc0d9] ${state === collectionState ? "text-whiter" : " fontColor "} hover:text-white flex w-full justify-between `}
                >
                  {state}
                  {/* {svg} */}
                </button>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

const CollectionCard = ({
  collection,
  products,
  deletePrevImage,
  uploadImage,
  getOtherProducts,
  productsPageNumber,
  hasNextPage,
  hasPreviousPage,
  isFetching,
  index
}) => {
  const [show, setShow] = useState(collection.show);
  const [collectionName, setCollectionName] = useState(collection.name);
  const [updatingCollectionName, setUpdatingCollectionName] = useState(false);
  const [description, setDescription] = useState(collection.description || "");
  const [openMenu, setOpenMenu] = useState(false);
  const [collectionState, setCollectionState] = useState(collection.state);
  const [includedProducts, setIncludedProducts] = useState([]);
  const [prevIncludedProducts, setPrevIncludedProducts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrl, setImageUrl] = useState(collection.imageUrl || "");
  const [numericPrice, setNumericPrice] = useState(collection.price || null);
  const [price, setPrice] = useState(collection.price);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  let stateTxtClr = "text-green-500";
  if (collection.state === "Removed") stateTxtClr = "text-red-500";
  else if (collection.state === "Out_of_Stock") stateTxtClr = "text-yellow-500";
  const router = useRouter();
  useEffect(() => {
    setIncludedProducts(
      collection.products.map((product) => (
        {id: product.id, imageUrls: product.imageUrls, name: product.name}
      ))
    );
  }, [updatingCollectionName]);

  const updateDisplayedProducts = () => {
    const filteredProducts = products.map((product) => {
      // Initialize a flag to check if the product is included
      let isIncluded = false;
      // Check if the product is in the includedProducts array
      for (const includedProduct of includedProducts) {
        if (includedProduct.id === product.node.id) {
          isIncluded = true;
          break; // Exit the loop once a match is found
        }
      }

      // Return null for products that should not be rendered; else, continue checking
      if (isIncluded) return null;
      
      // Check if the product is in the prevIncludedProducts array
      for (const prevIncludedProduct of prevIncludedProducts) {
        if (prevIncludedProduct.id === product.node.id) {
          isIncluded = true;
          break; // Exit the loop once a match is found
        }
      }

      // If the product is not in includedProducts and prevIncludedProducts,
      // render the ProductCard
      if (!isIncluded) {
        return product;
      }
      // Return null for products that should not be rendered
      return null;
    }).filter((item) => item !== null)
    setDisplayedProducts(filteredProducts);
  }
  useEffect(() => {
    updateDisplayedProducts();
  }, [products]);

  const include = (isIncluded, product) => {
    console.log("product.id: ", product.id);
    // Check if the product should be included
    if (isIncluded) {
      // Remove from the includedProducts collection
      setIncludedProducts((prevIncluded) =>
        prevIncluded.filter((item) => item.id !== product.id)
      ); // TODO: Consider handling errors if setIncludedProducts fails
      
      // Check if the product was previously in the collection
      const isInPrev = collection.products.some((item) => item.id === product.id);
  
      // Add to prevIncluded, only if it was connected to the collection previously in DB
      // else, Add to displayedProducts
      isInPrev 
        ? setPrevIncludedProducts((prevIncluded) =>[...prevIncluded, product]) 
        : setDisplayedProducts((prevDisplayed) => [...prevDisplayed, {node: product}]);;
      
      // No need to update displayedProducts in this case
      return;
    }
    
    // Add to the includedProducts collection
    setIncludedProducts((prevIncluded) => [...prevIncluded, product]);
  
    // Remove from prevIncluded if it was in it
    setPrevIncludedProducts((prevIncluded) =>
      prevIncluded.filter((item) => item.id !== product.id)
    );
  
    // Remove from displayedProducts if it was in it
    setDisplayedProducts((prevDisplayed) =>
      prevDisplayed.filter((item) => item.node.id !== product.id)
    );
  };
  
  
  const handlePriceChange = (e) => {
    const newValue = e.target.value;
    setPrice(newValue);
  
    // Check if the input can be parsed as a number, and update numericPrice accordingly.
    const parsedValue = parseFloat(newValue.replace('$', '').trim());
    setNumericPrice(isNaN(parsedValue) ? null : parsedValue);
  };

  //TODO: put both funcs in parent?
  const updateCollectionDetails = async () => {
    //TODO: Finish... (add error handling)⬇️
    if(!numericPrice || !collectionName) return;
    setIsUpdating(true);
    if(imageUpload && collection.imageUrl) await deletePrevImage(collection.imageUrl);
    const uploadedImageUrl = await uploadImage(imageUpload, imageUrl);

    // const productsToInclude = includedProducts.map((product) => ({id: product.id})).filter((id) => !collection.products.map((product) => product.id).includes(id.id));
    const productIdsInCollection = new Set(collection.products.map((product) => product.id));
    const productsToInclude = includedProducts
      .filter((product) => !productIdsInCollection.has(product.id))
      .map((product) => ({where: { id: product.id } }));

    const updatedCollection = await updateCollection({
      id: collection.id,
      name: collectionName,
      state: collectionState,
      description,
      products: productsToInclude,
      prevProducts: prevIncludedProducts.map((product) => ({id: product.id})),
      imageUrl: uploadedImageUrl,
      price: numericPrice,
    });
    await publishCollection(collection.id);

    setIncludedProducts([]);
    setPrevIncludedProducts([]);
    router.refresh();
    setUpdatingCollectionName(false);
    setIsUpdating(false);
  };

  const handleChangeImage = (e) => {
    e.preventDefault();

    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.includes("image")) {
      alert("Please upload an image!");

      return;
    }
    setImageUpload(file);

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = () => {
      const result = reader.result;

      // handleStateChange("image", result)
      setImageUrl(result);
    };
  };

  const deleteCollectionFunc = async () => { 
    setIsDeleting(true);
    await deleteCollection(collection.id);
    router.refresh();
    setIsDeleting(false);
  };
  const resetCollectionDetailsFunc = () => {
    updateDisplayedProducts();
    setCollectionName(collection.name);
    // setCollectionState(collection.state);
    setDescription(collection.description);
    setImageUrl(collection.imageUrl);
    setImageUpload(null);
    setNumericPrice(collection.price);
    // setIncludedProducts([]);
    setPrevIncludedProducts([]);
    setIsDeleting(false);
    setIsUpdating(false);
    // setUpdatingCollectionName(false);
    // setShow(collection.show);
    setPrice(collection.price);

  };
    
  return (
    <div
      className={`border-2 ${
        show ? "borderColor fontColor" : "border-gray-500 fontColorGray"
      } rounded-lg p-2`}
    >
      <div
        className={` p-2 flex max-sm:flex-col-reverse ${
          updatingCollectionName && "mb-8"
        } justify-between sm:flex-wrap max-sm:gap-4`}
      >
        {!updatingCollectionName && collection.imageUrl && (
          <div className="max-sm:flex  items-center justify-center ">
            <div className="flex items-center relative rounded-lg overflow-hidden w-[100px] h-[100px]">
              <Image
                src={collection.imageUrl}
                alt={collection.name}
                fill
                className="rounded-lg"
              />
            </div>
          </div>
        )}
        {updatingCollectionName && (
          <div className="flexCenter flex-col lg:min-h-[200px] min-h-[100px] relative w-full py-16">
            {!imageUpload && (
              <label
                htmlFor="poster"
                className="flexCenter z-10 text-center w-full h-[300px] p-20 dashedBorder rounded-lg aspect-square fontColor absolute"
              >
                Choose an Image <br /> (optional)
              </label>
            )}
            <div className="flexCenter bg-gray-500 rounded-lg aspect-square overflow-hidden w-full sm:w-1/2 md:w-1/3 lg:w-1/4 h-[200px] ">
              <input
                id="image"
                type="file"
                accept="image/*"
                className="form_image-input "
                onChange={(e) => handleChangeImage(e)}
              /> 
              {imageUrl && (
                <Image
                  src={imageUrl}
                  className=" object-cover z-20 w-full h-full rounded-lg "
                  alt="image"
                  // fill
                  width={1000}
                  height={1000}
                />
              )}
            </div>
            {imageUpload?.name.slice(0, 20)}...
          </div>
        )}
        <div className="sm:w-2/3  ">
          {updatingCollectionName ? (
            <div className="flex flex-col justify-around items-start w-full h-full max-sm:gap-2 ">
              <label htmlFor="collectionName" className="w-full">
                <h1>Name</h1>
                <input
                  type="text"
                  id="collectionName"
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  className="rounded-md border-2 p-2 borderColor colorScheme"
                />
              </label>
              <label htmlFor="collectionDescription" className="w-full">
                <h1>Description</h1>
                <input
                  id="collectionDescription"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-md border-2 p-2 borderColor colorScheme w-full"
                />
              </label>
              <div className="flex flex-col w-[100px] colorScheme">
                <label htmlFor="price" className="text-sm font-medium">Price</label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={`$${numericPrice !== null ? numericPrice : ''}`}
                  onChange={handlePriceChange}
                  className="border rounded-lg py-2 px-3"
                />
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold">{collection.name}</h1>
              <h2>{collection.description}</h2>
              <h2>Price: ${collection.price}</h2>
            </div>
          )}
        </div>
        <div
          className={`flex gap-4 items-start sm:flex-col ${
            updatingCollectionName
              ? " items-center"
              : "w-full sm:w-fit justify-center"
          }`}
        >
          {updatingCollectionName ? (
            <button
              className="flex w-full justify-center sm:justify-between hover:text-[#4bc0d9] max-sm:flex-col items-center sm:gap-2"
              onClick={updateCollectionDetails}
            >
              <span className="text-md">Submit</span>
              <SVGCheck/>
            </button>
          ) : (
            <button className="hover:text-[#4bc0d9]" onClick={() => setUpdatingCollectionName(true)}>
              <SVGPencil/>
            </button>
          )}
          {openMenu ? (
            <div className="mb-4 relative">
              <CollectionStateMenu
                collectionState={collectionState}
                setCollectionState={setCollectionState}
                collectionId={collection.id}
                isOpen={openMenu}
                setIsOpen={setOpenMenu}
              />
              <button
                onClick={() => setOpenMenu(true)}
                className="border-2 border-gray-500 rounded-full px-3 py-1 "
              >
                <h1 className={`${stateTxtClr} font-bold`}>
                  {collectionState}
                </h1>
              </button>
            </div>
          ) : (
            <div className="sm:flex sm:justify-between items-center gap-2">
              {updatingCollectionName && <h2 className="text-center">State</h2>}
              <button
                onClick={() => setOpenMenu(true)}
                className="border-2 border-gray-500 hover:border-[#4bc0d9] rounded-full px-3 py-1 "
              >
                <h1 className={`${stateTxtClr} font-bold`}>
                  {collectionState}
                </h1>
              </button>
            </div>
          )}

          {!updatingCollectionName ? (
            <button className="hover:text-red-500" disabled={isDeleting} onClick={deleteCollectionFunc}>
              {!isDeleting ? (
                <SVGTrash width="30px" height="30px" />
              ) : (
                <SVGLoading/>
              )}
            </button>
          ) : (
            <>
              <button
                className="flex w-full max-sm:flex-col items-center justify-center sm:justify-between sm:gap-2 hover:text-yellow-500"
                onClick={() => setUpdatingCollectionName(false)}
              >
                Cancel
                <SVGCancel width="30px" height="30px" />
              </button>
              <button
                className="flex w-full max-sm:flex-col items-center justify-center sm:justify-between sm:gap-2 hover:text-[#4bc0d9]"
                onClick={resetCollectionDetailsFunc}
              >
                Default
                <svg
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 30 30"
                  enableBackground="new 0 0 32 32"
                  xmlSpace="preserve"
                  width={30}
                  height={30}
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.875}
                    strokeMiterlimit={10}
                    d="M24.094 10.219C22.406 6.938 18.938 4.688 15 4.688c-4.406 0 -8.063 2.719 -9.563 6.563"
                  />
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.875}
                    strokeMiterlimit={10}
                    d="M5.813 19.688c1.688 3.281 5.156 5.625 9.188 5.625 4.406 0 8.063 -2.719 9.563 -6.563"
                  />
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.875}
                    strokeMiterlimit={10}
                    points="26,5 26,11 20,11 "
                    d="M24.375 4.688L24.375 10.313L18.75 10.313"
                  />
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.875}
                    strokeMiterlimit={10}
                    points="6,27 6,21 12,21 "
                    d="M5.625 25.313L5.625 19.688L11.25 19.688"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      {updatingCollectionName && (
        <div className="flex flex-col gap-3 mt-3">
          <h1 className="text-xl mb-2">Products</h1>
          <div className="flex flex-wrap gap-4">
            {includedProducts.map((product, productIndex) => {
              return (
                <ProductCard
                  key={`Update Collection (Included Products): ${product.id} ${index} ${collection.id}`}
                  product={product}
                  collectionId={collection.id}
                  include={include}
                  included={true}
                  inputId={`inputId: ${product.id} ${productIndex} ${collection.id}`}
                />
              );
            })}
          </div>
          {(includedProducts.length > 0 && (prevIncludedProducts.length > 0 || products.length > 0)) && <div className="bgColorGray w-3/4 h-1 rounded-full mt-1 mb-4"></div>}
          {prevIncludedProducts.length > 0 && <div className="flex flex-wrap gap-4">
            <h2 className="w-full">Removed</h2>
            {prevIncludedProducts.map((product, productIndex) => {
              return (
                <ProductCard
                  key={`Update Collection (Previous Included Products): ${product.id} ${index} ${collection.id}`}
                  product={product}
                  collectionId={collection.id}
                  include={include}
                  included={false}
                  inputId={`inputId: ${product.id} ${productIndex} ${collection.id}`}
                />
              );
            })}
          </div>}
          {(prevIncludedProducts.length > 0 && products.length > 0) && <div className="bgColorGray w-3/4 h-1 rounded-full mt-1 mb-4"></div>}
          <div className="flex flex-wrap gap-4">
            {
              displayedProducts.length === 0 ? 
                <h1 className="w-full text-center fontColor">All products in this page are used <br /> Move to the next/previous page</h1>
              :
                displayedProducts.map((product, productIndex) => (
                  <ProductCard
                    key={`Update Collection (Displayed Products): ${product.node.id} ${index} ${collection.id}`}
                    product={product.node}
                    include={include}
                    included={false}
                    inputId={`inputId: ${product.id} ${productIndex} ${collection.id}`}
                  />
                ))
            }

          </div>
          <div className="flex items-center justify-center space-x-4 w-full">
            <button
              disabled={!hasPreviousPage ? true : isFetching }
              onClick={(e) => getOtherProducts(e, "before")}
              className={`${
                !hasPreviousPage
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : isFetching ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#4bc0d9] hover:bg-[#3ca8d0]"
              } text-white font-bold py-2 px-4 rounded-full focus:outline-none`}
            >
              &lt;
            </button>
            <span className="textColorGray font-semibold">Page {productsPageNumber}</span>
            <button
              disabled={!hasNextPage ? true : isFetching }
              onClick={(e) => getOtherProducts(e, "after")}
              className={`${
                !hasNextPage
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : isFetching ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#4bc0d9] hover:bg-[#3ca8d0]"
              } text-white font-bold py-2 px-4 rounded-full focus:outline-none`}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

const AdminCollectionsPage = ({
  collectionsData,
  productsData,
  hasNextPage,
  hasPreviousPage,
}) => {
  const [productsPageNumber, setProductsPageNumber] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
    if (isDarkModeLocal) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    if(isFirstRender){
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.delete("productsCursor");
      currentParams.delete("beforeOrAfter");
      const newSearchParams = currentParams.toString();
      const newPathname = `${window.location.pathname}?${newSearchParams}`;
      
      router.push(newPathname);  
      setIsFirstRender(false)
    }
  }, []);
  const deletePrevImage = async (prevImgUrl) => {
    //To remove the old profile Image from the database
    try {
      const imageRef = ref(storage, prevImgUrl);
      await deleteObject(imageRef).catch((error) => {
        console.log(error.message);
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  const uploadImage = async (imagePath, givenImageUrl) => {
    //To add the new profile image to the database
    if (imagePath == null || !imagePath) {
      return givenImageUrl;
    }
    const imageRef = ref(storage, `profileImages/${imagePath.name + v4()}`);
    const imageUrl = await uploadBytes(imageRef, imagePath).then(
      async (snapshot) => {
        const downloadUrl = await getDownloadURL(snapshot.ref).then((url) => {
          return url;
        });
        return downloadUrl;
      }
    );
    return imageUrl;
  };
  const getOtherProducts = async (e, beforeOrAfter) => {
    e.preventDefault();
    //TODO: put in child component Or keep it??
    if(beforeOrAfter === "after" && !hasNextPage) return;
    if(beforeOrAfter === "before" && !hasPreviousPage) return;
    setIsFetching(true);
    

    const currentParams = new URLSearchParams(window.location.search);
    const cursor = beforeOrAfter === "before" ? productsData[0].cursor : productsData[productsData.length - 1].cursor;
    currentParams.set("productsCursor", cursor);
    currentParams.set("beforeOrAfter", beforeOrAfter);

    const newSearchParams = currentParams.toString();
    const newPathname = `${window.location.pathname}?${newSearchParams}`;
    router.push(newPathname);

    setProductsPageNumber(prev => beforeOrAfter === "after" ? prev + 1 : prev - 1);
    router.refresh();
    setTimeout(function () {
      setIsFetching(false);
    }, 1000);
  };
  return (
    <div className="h-screen bgColor fontColor p-4 gap-6 flex flex-col overflow-y-scroll overflow-x-hidden pb-14 ">
      <div className=" flex gap-4 flex-col ">
        {collectionsData.map((collection, index) => (
          <CollectionCard
            key={`${index}: ${collection.node.id}`}
            collection={collection.node}
            products={productsData}
            deletePrevImage={deletePrevImage}
            uploadImage={uploadImage}
            getOtherProducts={getOtherProducts}
            productsPageNumber={productsPageNumber}
            // setProductsPageNumber={setProductsPageNumber}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            isFetching={isFetching}
            index={index}
          />
        ))}
      </div>
      <CreateCollectionForm
        products={productsData}
        getOtherProducts={getOtherProducts}
        productsPageNumber={productsPageNumber}
        setProductsPageNumber={setProductsPageNumber}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        isFetching={isFetching}
        uploadImage={uploadImage}
      />
    </div>
  );
};

export default AdminCollectionsPage;
