"use client";

import { deleteCategory, publishCategory, updateCategory } from "@/lib";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CreateCategoryForm from "./CreateCategoryForm";

const CategoryCard = ({ category }) => {
  const [show, setShow] = useState(category.show);
  const [categoryName, setCategoryName] = useState(category.name);
  const [updatingCategoryName, setUpdatingCategoryName] = useState(false);
  const [description, setDescription] = useState(category.description || "");
  const router = useRouter();

  const updateCategoryDetails = async () => {
    const updatedCategory = await updateCategory({categoryId: category.id, name: categoryName, show, description});
    await publishCategory(category.id);
    router.refresh();
    setUpdatingCategoryName(false);
  }
  const updateCategoryShowState = async () => {
    const showState = !show
    const updatedCategory = await updateCategory({categoryId: category.id, name: categoryName, show: showState, description});
    await publishCategory(category.id);
    router.refresh();
    setShow(!show);
  }
  const cancelUpdateCategory = () => {
    setUpdatingCategoryName(false);
    setShow(category.show);
    setCategoryName(category.name);
    setDescription(category.description);
  }

  const deleteCategoryFunc = async () => {
    await deleteCategory(category.id);
    router.refresh();
  }


  return (
    <div className={`border-2 ${show ? "borderColor fontColor" : "border-gray-500 fontColorGray"} rounded-lg p-2 flex justify-between`}>
      <div >
        {updatingCategoryName?
          <div className="flex flex-col justify-around items-center h-full" >
            <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="rounded-md border-2 p-2 borderColor colorScheme" />
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-md border-2 p-2 borderColor colorScheme" />
          </div>
          :
          <div>
            <h1 className="text-xl font-bold">{category.name}</h1>
            <h2>{category.description}</h2>
          </div>
        }
      </div>
      <div className={`flex gap-4 items-start ${updatingCategoryName ? "flex-col" : ""}`}>
        {updatingCategoryName ? 
          <button onClick={updateCategoryDetails}>
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
          :
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
        }
        {category.show? 
          <button onClick={updateCategoryShowState}>
            <svg
              fill="currentColor"
              width="30px"
              height="30px"
              viewBox="0 -0.6 20.4 20.4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>{"remove"}</title>
              <path d="M10.2 15q-2.512 0 -4.537 -1.462 -2.063 -1.462 -3.262 -3.938 1.2 -2.475 3.262 -3.938 2.025 -1.462 4.537 -1.462 2.4 0 4.5 1.537 2.1 1.5 3.3 3.862 -1.2 2.362 -3.3 3.9 -2.1 1.5 -4.5 1.5Zm0 -1.8q1.5 0 2.55 -1.05t1.05 -2.55q0 -1.5 -1.05 -2.55t-2.55 -1.05q-1.5 0 -2.55 1.05t-1.05 2.55q0 1.5 1.05 2.55t2.55 1.05Zm0 -1.5q-0.862 0 -1.462 -0.6 -0.637 -0.637 -0.637 -1.5t0.637 -1.462q0.6 -0.637 1.462 -0.637t1.5 0.637q0.6 0.6 0.6 1.462t-0.6 1.5q-0.637 0.6 -1.5 0.6Z" />
            </svg>
          </button>
          :
          <button onClick={updateCategoryShowState}>
            <svg
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              width="30px"
              height="30px"
              viewBox="0 0 1.95 1.95"
              enableBackground="new 0 0 52 52"
              xmlSpace="preserve"
            >
              <title>{"show"}</title>
              <g>
                <path d="M1.942 0.941c-0.06 -0.12 -0.139 -0.229 -0.236 -0.315L1.387 0.941v0.034c0 0.229 -0.184 0.412 -0.412 0.412h-0.034l-0.203 0.203c0.075 0.015 0.154 0.026 0.232 0.026 0.424 0 0.791 -0.247 0.968 -0.604 0.015 -0.026 0.015 -0.049 0.004 -0.071z" />
                <path d="m1.819 0.21 -0.079 -0.079c-0.022 -0.022 -0.064 -0.019 -0.09 0.011l-0.274 0.274C1.252 0.364 1.117 0.337 0.975 0.337 0.551 0.337 0.184 0.585 0.007 0.941c-0.011 0.022 -0.011 0.049 0 0.068 0.083 0.169 0.206 0.307 0.36 0.412l-0.225 0.229c-0.026 0.026 -0.03 0.068 -0.011 0.09l0.079 0.079c0.022 0.022 0.064 0.019 0.09 -0.011L1.808 0.3c0.03 -0.026 0.034 -0.068 0.011 -0.09zM0.563 0.975c0 -0.229 0.184 -0.412 0.412 -0.412 0.075 0 0.142 0.019 0.203 0.052l-0.112 0.112c-0.03 -0.007 -0.06 -0.015 -0.09 -0.015 -0.146 0 -0.263 0.116 -0.263 0.263 0 0.03 0.007 0.06 0.015 0.09l-0.112 0.112C0.581 1.117 0.563 1.05 0.563 0.975z" />
              </g>
            </svg>
          </button>
        }
        {!updatingCategoryName ?
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
        :
          <button onClick={cancelUpdateCategory}>
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
        }
      </div>

    </div>
  )
}

const AdminCategoriesPage = ({ categoriesData }) => {
  useEffect(() => {
    const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
    if(isDarkModeLocal) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, []);
  return (
    <div className="h-screen bgColor fontColor p-4 gap-6 flex flex-col overflow-y-scroll overflow-x-hidden pb-14 ">
      <div className=" flex gap-4 flex-col ">
        {categoriesData.map((category) => (
          <CategoryCard key={category.id} category={category}/>
        ))}
      </div>
      <CreateCategoryForm />
    </div>
  )
}

export default AdminCategoriesPage