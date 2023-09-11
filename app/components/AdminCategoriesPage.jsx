"use client";

import {
  deleteCategory,
  publishCategory,
  publishCollection,
  updateCategory,
  updateCategoryState,
} from "@/lib";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CreateCategoryForm from "./CreateCategoryForm";
import Image from "next/image";

export const ProductCard = ({ product, included, include, inputId }) => {
  //TODO: Remove this from here and collections, out in seperate component
  return (
    <div className="flex flex-col items-center gap-2 w-[70px] group">
      <label
        className={`relative cursor-pointer ${
          included
            ? "border-[#4bc0d9]"
            : "border-gray-300 group-hover:border-[#3ca8d0]"
        } border-2 rounded-[10px] transition duration-300`}
        htmlFor={inputId}
      >
        <input
          className="hidden"
          type="checkbox"
          id={inputId}
          name="includeItem"
          onChange={() =>
            include(included, {
              id: product.id,
              imageUrls: product.imageUrls,
              name: product.name,
            })
          }
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
            included
              ? "bg-[#4bc0d9] group-hover:bg-[#3ca8d0] text-gray-100 "
              : "bg-white text-gray-600 "
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

  const changeCollectionState = async (state) => {
    const updatedProduct = await updateCollectionState({ collectionId, state });
    await publishCollection(collectionId);
    //publishOrderItems && publishTheUser??
    setCollectionState(updatedProduct.updateProduct.state);
    router.refresh();
  };

  return (
    <div
      ref={cardMenuRef}
      className="absolute w-48 h-10 bg-white fontColor rounded-t-md right-2 -top-2 pt-1 pr-1 "
    >
      <div>
        <div className="w-full flex justify-end">
          <button
            className="p-1 fontColorGray hover:text-gray-100 hover:bg-[#2482c8] rounded-full focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              // fill={!isDarkMode ? '#030303' : '#fff'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="absolute right-0 w-48 fontColor bg-white rounded-md shadow-lg z-10">
          <ul>
            {states.map((state) => {
              let bg = "bg-white";
              let disable = false;
              let txtClr = "fontColor";
              if (state === collectionState) {
                bg = "bg-[#2482c8]";
                disable = true;
                txtClr = "text-white";
              }
              return (
                <button
                  key={state}
                  disabled={disable}
                  onClick={() => {
                    changeCollectionState(state);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 rounded-md hover:bg-[#2482c8] hover:text-white ${txtClr} ${bg} flex w-full justify-between `}
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

const CategoryCard = ({
  category,
  products,
  hasNextPage,
  hasPreviousPage,
  productsPageNumber,
  isFetching,
  getOtherProducts,
}) => {
  const [show, setShow] = useState(category.show);
  const [isUpdatingShow, setIsUpdatingShow] = useState(false);
  const [categoryName, setCategoryName] = useState(category.name);
  const [updatingCategoryName, setUpdatingCategoryName] = useState(false);
  const [description, setDescription] = useState(category.description || "");

  const [includedProducts, setIncludedProducts] = useState([]);
  const [prevIncludedProducts, setPrevIncludedProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isError, setIsError] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIncludedProducts(
      category.products.map((product) => ({
        id: product.id,
        imageUrls: product.imageUrls,
        name: product.name,
      }))
    );
  }, [updatingCategoryName]);
  useEffect(() => {
    setShow(category.show);
    setIncludedProducts(
      category.products.map((product) => ({
        id: product.id,
        imageUrls: product.imageUrls,
        name: product.name,
      }))
    );
  }, [category]);

  const include = (isIncluded, product) => {
    console.log("product.id: ", product.id);
    // Check if the product should be included
    if (isIncluded) {
      // Remove from the includedProducts category
      setIncludedProducts((prevIncluded) =>
        prevIncluded.filter((item) => item.id !== product.id)
      ); // TODO: Consider handling errors if setIncludedProducts fails

      // Check if the product was previously in the category
      const isInPrev = category.products.some((item) => item.id === product.id);

      // Add to prevIncluded, only if it was connected to the category previously in DB
      // else, Add to displayedProducts
      isInPrev
        ? setPrevIncludedProducts((prevIncluded) => [...prevIncluded, product])
        : setDisplayedProducts((prevDisplayed) => [
            ...prevDisplayed,
            { node: product },
          ]);

      // No need to update displayedProducts in this case
      return;
    }

    // Add to the includedProducts category
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

  const updateDisplayedProducts = () => {
    const filteredProducts = products
      .map((product) => {
        // Initialize a flag to check if the product is included
        let isIncluded = false;

        // Check if the product is in the includedProducts array
        for (const includedProduct of category.products) {
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
      })
      .filter((item) => item !== null);
    setDisplayedProducts(filteredProducts);
  };
  useEffect(() => {
    updateDisplayedProducts();
  }, [products]);

  const updateCategoryDetails = async () => {
    //TODO: After submission, refresh the information as neccessary
    if (!categoryName) {
      setIsError(true);
      setTimeout(function () {
        setIsError(false);
      }, 2000);
      return;
    };
    
    // Initialize a variable to track if all products in includedProducts are the same as products in category.products
    const areAllProductsSame = includedProducts.every((includedProduct) =>
    // Check if there is at least one product in category.products with the same id as the current includedProduct
    category.products.some((product) => includedProduct.id === product.id)
    );

    if ( //Make sure something is changed before submission
      categoryName === category.name &&
      description === category.description &&
      prevIncludedProducts.length === 0 &&
      areAllProductsSame &&
      !isUpdating &&
      !isDeleting &&
      category.products.length === includedProducts.length
    )
      return;

    setIsUpdating(true);
    const productIdsInCategory = new Set(
      category.products.map((product) => product.id)
    );
    const productsToInclude = includedProducts
      .filter((product) => !productIdsInCategory.has(product.id))
      .map((product) => ({ where: { id: product.id } }));
    const updatedCategory = await updateCategory({
      categoryId: category.id,
      name: categoryName,
      show,
      description,
      products: productsToInclude,
      prevProducts: prevIncludedProducts.map((product) => ({ id: product.id })),
    });
    await publishCategory(category.id);
    router.refresh();
    resetCollectionDetailsFunc();
    setUpdatingCategoryName(false);
    setIsUpdating(false);
  };
  const updateCategoryShowState = async () => {
    //TODO: After update, refresh the information as neccessary
    setIsUpdatingShow(true);
    const showState = !show;
    const updatedCategory = await updateCategoryState({
      categoryId: category.id,
      show: showState,
    });
    await publishCategory(category.id);
    router.refresh();
    setShow(!show);
    setIsUpdatingShow(false);
  };
  const cancelUpdateCategory = () => {
    setUpdatingCategoryName(false);
    setShow(category.show);
    setCategoryName(category.name);
    setDescription(category.description);
  };

  const deleteCategoryFunc = async () => {
    setIsDeleting(true);
    await deleteCategory(category.id);
    router.refresh();
    setIsDeleting(false);
  };
  const resetCollectionDetailsFunc = async () => {
    setShow(category.show);
    setCategoryName(category.name);
    setDescription(category.description);
    setIncludedProducts(
      category.products.map((product) => ({
        id: product.id,
        imageUrls: product.imageUrls,
        name: product.name,
      }))
    );
    setPrevIncludedProducts([]);
    updateDisplayedProducts();
  };

  return (
    <div
      className={`flex flex-col border-2 ${
        show ? "borderColor fontColor" : "border-gray-500 fontColorGray"
      } rounded-lg p-2`}
    >
      <div className={` flex justify-between`}>
        <div>
          {updatingCategoryName ? (
            <div className="flex flex-col justify-around items-center h-full">
              <label htmlFor="name">
                <h1>Name</h1>

                <input
                  id="name"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  className="rounded-md border-2 p-2 borderColor colorScheme"
                />
              </label>
              <label htmlFor="description">
                <h1>Brief Description</h1>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-md border-2 p-2 borderColor colorScheme"
                />
              </label>
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold">{category.name}</h1>
              <h2>{category.description}</h2>
            </div>
          )}
        </div>
        {isError && <p className="text-red-500">Please provide a name </p>}
        
        <div
          className={`flex gap-4 items-start ${
            updatingCategoryName ? "flex-col" : ""
          }`}
        >
          {updatingCategoryName ? (
            isUpdating ? (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <button
                className="flex justify-between items-center w-full"
                onClick={updateCategoryDetails}
              >
                Submit
                <svg
                  fill="currentColor"
                  width="30px"
                  height="30px"
                  viewBox="0 0 0.9 0.9"
                  id="check"
                  data-name="Flat Color"
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon flat-color"
                >
                  <path
                    id="primary"
                    d="M0.375 0.675a0.037 0.037 0 0 1 -0.027 -0.011l-0.188 -0.188a0.037 0.037 0 0 1 0.053 -0.053l0.161 0.161 0.311 -0.311a0.037 0.037 0 1 1 0.053 0.053l-0.337 0.337A0.037 0.037 0 0 1 0.375 0.675Z"
                    style={{
                      fill: "currentColor",
                    }}
                  />
                </svg>
              </button>
            )
          ) : (
            <button onClick={() => setUpdatingCategoryName(true)}>
              <svg
                fill="currentColor"
                width="30px"
                height="30px"
                viewBox="0 0 1.35 1.35"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <title>{"edit-line"}</title>
                <path
                  className="clr-i-outline clr-i-outline-path-1"
                  d="M1.27 0.312 1.05 0.091a0.078 0.078 0 0 0 -0.11 0L0.16 0.87l-0.071 0.307a0.077 0.077 0 0 0 0.075 0.094 0.08 0.08 0 0 0 0.016 0l0.311 -0.071 0.779 -0.779a0.078 0.078 0 0 0 0 -0.11ZM0.453 1.132l-0.291 0.061 0.066 -0.286L0.812 0.326l0.225 0.225ZM1.087 0.497l-0.225 -0.225 0.131 -0.13 0.221 0.225Z"
                />
                <path
                  x={0}
                  y={0}
                  width={36}
                  height={36}
                  fillOpacity={0}
                  d="M0 0H1.35V1.35H0V0z"
                />
              </svg>
            </button>
          )}
          {isUpdatingShow ? (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          ) : show ? (
            <button
              className="flex justify-between items-center w-full"
              onClick={updateCategoryShowState}
            >
              {updatingCategoryName && "Hide"}
              <svg
                fill="currentColor"
                width="30px"
                height="30px"
                viewBox="0 -0.6 20.4 20.4"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>{"Hide from user"}</title>
                <path d="M10.2 15q-2.512 0 -4.537 -1.462 -2.063 -1.462 -3.262 -3.938 1.2 -2.475 3.262 -3.938 2.025 -1.462 4.537 -1.462 2.4 0 4.5 1.537 2.1 1.5 3.3 3.862 -1.2 2.362 -3.3 3.9 -2.1 1.5 -4.5 1.5Zm0 -1.8q1.5 0 2.55 -1.05t1.05 -2.55q0 -1.5 -1.05 -2.55t-2.55 -1.05q-1.5 0 -2.55 1.05t-1.05 2.55q0 1.5 1.05 2.55t2.55 1.05Zm0 -1.5q-0.862 0 -1.462 -0.6 -0.637 -0.637 -0.637 -1.5t0.637 -1.462q0.6 -0.637 1.462 -0.637t1.5 0.637q0.6 0.6 0.6 1.462t-0.6 1.5q-0.637 0.6 -1.5 0.6Z" />
              </svg>
            </button>
          ) : (
            <button
              className="flex justify-between items-center w-full"
              onClick={updateCategoryShowState}
            >
              {updatingCategoryName && "Show"}
              {/* TODO: FIX, "Show" svg is not updateing */}
              <svg
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                width="30px"
                height="30px"
                viewBox="0 0 1.95 1.95"
                enableBackground="new 0 0 52 52"
                xmlSpace="preserve"
              >
                <title>{"Show to user"}</title>
                <g>
                  <path d="M1.942 0.941c-0.06 -0.12 -0.139 -0.229 -0.236 -0.315L1.387 0.941v0.034c0 0.229 -0.184 0.412 -0.412 0.412h-0.034l-0.203 0.203c0.075 0.015 0.154 0.026 0.232 0.026 0.424 0 0.791 -0.247 0.968 -0.604 0.015 -0.026 0.015 -0.049 0.004 -0.071z" />
                  <path d="m1.819 0.21 -0.079 -0.079c-0.022 -0.022 -0.064 -0.019 -0.09 0.011l-0.274 0.274C1.252 0.364 1.117 0.337 0.975 0.337 0.551 0.337 0.184 0.585 0.007 0.941c-0.011 0.022 -0.011 0.049 0 0.068 0.083 0.169 0.206 0.307 0.36 0.412l-0.225 0.229c-0.026 0.026 -0.03 0.068 -0.011 0.09l0.079 0.079c0.022 0.022 0.064 0.019 0.09 -0.011L1.808 0.3c0.03 -0.026 0.034 -0.068 0.011 -0.09zM0.563 0.975c0 -0.229 0.184 -0.412 0.412 -0.412 0.075 0 0.142 0.019 0.203 0.052l-0.112 0.112c-0.03 -0.007 -0.06 -0.015 -0.09 -0.015 -0.146 0 -0.263 0.116 -0.263 0.263 0 0.03 0.007 0.06 0.015 0.09l-0.112 0.112C0.581 1.117 0.563 1.05 0.563 0.975z" />
                </g>
              </svg>
            </button>
          )}
          {!updatingCategoryName ? (
            isDeleting ? (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <button onClick={deleteCategoryFunc}>
                <svg
                  width="30px"
                  height="30px"
                  viewBox="0 0 0.563 0.563"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.206 0.037a0.019 0.019 0 0 0 0 0.037h0.15a0.019 0.019 0 0 0 0 -0.037h-0.15ZM0.112 0.131a0.019 0.019 0 0 1 0.019 -0.019h0.3a0.019 0.019 0 0 1 0 0.037H0.412v0.3a0.037 0.037 0 0 1 -0.037 0.037H0.188a0.037 0.037 0 0 1 -0.037 -0.037V0.15h-0.019a0.019 0.019 0 0 1 -0.019 -0.019ZM0.188 0.15h0.188v0.3H0.188V0.15Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            )
          ) : (
            <>
              <button
                className="flex justify-between gap-1 items-center w-full"
                onClick={cancelUpdateCategory}
              >
                Cancel
                <svg
                  fill="currentColor"
                  width="30px"
                  height="30px"
                  viewBox="0 0 1.35 1.35"
                  preserveAspectRatio="xMidYMid meet"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <title>{"cancel-line"}</title>
                  <path
                    className="clr-i-outline clr-i-outline-path-1"
                    d="M0.675 0.075a0.6 0.6 0 1 0 0.6 0.6A0.6 0.6 0 0 0 0.675 0.075ZM0.15 0.675a0.522 0.522 0 0 1 0.129 -0.343l0.739 0.739A0.525 0.525 0 0 1 0.15 0.675Zm0.921 0.343L0.332 0.279a0.525 0.525 0 0 1 0.739 0.739Z"
                  />
                  <path
                    x={0}
                    y={0}
                    width={36}
                    height={36}
                    fillOpacity={0}
                    d="M0 0H1.35V1.35H0V0z"
                  />
                </svg>
              </button>
              <button
                className="flex justify-between gap-1 items-center w-full"
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
      {updatingCategoryName && (
        <div className="flex flex-col gap-3 mt-3">
          <h1 className="text-xl mb-2">Products</h1>
          <div className="flex flex-wrap gap-4">
            {includedProducts.map((product, productIndex) => {
              return (
                <ProductCard
                  key={`Update Catgeory (Included Products): ${product.id} ${category.id}`}
                  product={product}
                  categoryId={category.id}
                  include={include}
                  included={true}
                  inputId={`inputId: ${product.id} ${productIndex} ${category.id}`}
                />
              );
            })}
          </div>
          {includedProducts.length > 0 &&
            (prevIncludedProducts.length > 0 || products.length > 0) && (
              <div className="bgColorGray w-3/4 h-1 rounded-full mt-1 mb-4"></div>
            )}
          {prevIncludedProducts.length > 0 && (
            <div className="flex flex-wrap gap-4">
              <h2 className="w-full">Removed</h2>
              {prevIncludedProducts.map((product, productIndex) => {
                return (
                  <ProductCard
                    key={`Update Category (Previous Included Products): ${product.id} ${category.id}`}
                    product={product}
                    categoryId={category.id}
                    include={include}
                    included={false}
                    inputId={`inputId: ${product.id} ${productIndex} ${category.id}`}
                  />
                );
              })}
            </div>
          )}
          {prevIncludedProducts.length > 0 && products.length > 0 && (
            <div className="bgColorGray w-3/4 h-1 rounded-full mt-1 mb-4"></div>
          )}
          <div className="flex flex-wrap gap-4">
            {displayedProducts.length === 0 ? (
              <h1 className="w-full text-center fontColor">
                All products in this page are used <br /> Move to the
                next/previous page
              </h1>
            ) : (
              displayedProducts.map((product, productIndex) => (
                <ProductCard
                  key={`Update Category (Displayed Products): ${product.node.id} ${category.id}`}
                  product={product.node}
                  include={include}
                  included={false}
                  inputId={`inputId: ${product.id} ${productIndex} ${category.id}`}
                />
              ))
            )}
          </div>
          <div className="flex items-center justify-center space-x-4 w-full">
            <button
              disabled={!hasPreviousPage ? true : isFetching}
              onClick={(e) => getOtherProducts(e, "before")}
              className={`${
                !hasPreviousPage
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : isFetching
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#4bc0d9] hover:bg-[#3ca8d0]"
              } text-white font-bold py-2 px-4 rounded-full focus:outline-none`}
            >
              &lt;
            </button>
            <span className="textColorGray font-semibold">
              Page {productsPageNumber}
            </span>
            <button
              disabled={!hasNextPage ? true : isFetching}
              onClick={(e) => getOtherProducts(e, "after")}
              className={`${
                !hasNextPage
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : isFetching
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#4bc0d9] hover:bg-[#3ca8d0]"
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

const AdminCategoriesPage = ({
  categoriesData,
  products,
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
    if (isFirstRender) {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.delete("productsCursor");
      currentParams.delete("beforeOrAfter");
      const newSearchParams = currentParams.toString();
      const newPathname = `${window.location.pathname}?${newSearchParams}`;

      router.push(newPathname);
      setIsFirstRender(false);
    }
  }, []);

  const getOtherProducts = async (e, beforeOrAfter) => {
    e.preventDefault();
    if (beforeOrAfter === "after" && !hasNextPage) return;
    if (beforeOrAfter === "before" && !hasPreviousPage) return;
    setIsFetching(true);

    const currentParams = new URLSearchParams(window.location.search);
    const cursor =
      beforeOrAfter === "before"
        ? products[0].cursor
        : products[products.length - 1].cursor;
    currentParams.set("productsCursor", cursor);
    currentParams.set("beforeOrAfter", beforeOrAfter);

    const newSearchParams = currentParams.toString();
    const newPathname = `${window.location.pathname}?${newSearchParams}`;
    router.push(newPathname);

    setProductsPageNumber((prev) =>
      beforeOrAfter === "after" ? prev + 1 : prev - 1
    );
    router.refresh();
    setTimeout(function () {
      setIsFetching(false);
    }, 1000);
  };

  return (
    <div className="h-screen bgColor fontColor p-4 gap-6 flex flex-col overflow-y-scroll overflow-x-hidden pb-14 ">
      <div className=" flex gap-4 flex-col ">
        {categoriesData.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            products={products}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            getOtherProducts={getOtherProducts}
            productsPageNumber={productsPageNumber}
            isFetching={isFetching}
          />
        ))}
      </div>
      <CreateCategoryForm
        products={products}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        getOtherProducts={getOtherProducts}
        productsPageNumber={productsPageNumber}
        isFetching={isFetching}
      />
    </div>
  );
};

export default AdminCategoriesPage;
