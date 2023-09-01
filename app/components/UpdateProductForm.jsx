"use client";
import { useEffect, useState } from "react";
import Select from "react-select";
import ReactMarkdown from "react-markdown";
import {
  publishImagesUrls,
  publishProduct,
  publishProductVariants,
  updateProduct,
} from "@/lib";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebaseConfig";

const PillVariant = ({ size, color, index, deleteItem, quantity, decreaseQuantity, increaseQuantity, infiniteQuantity }) => {
  return (
    <div className="flex flex-col items-center px-3 py-1 productCardBg rounded-full">
      {/*  */}
      <div>
        {size && size} {size && color && "/"} {color && color}
        <button className="text-red-600 ml-2" onClick={(e) => {deleteItem(index); e.preventDefault()}}>
          X
        </button>
      </div>
      {/*  */}
      <div className="flex gap-2">
        <button className="rounded-full bgColorGray aspect-square px-2 " onClick={(e) => decreaseQuantity(e, index)}>-</button>
        <button onClick={(e) => infiniteQuantity(e, index)}>♾️</button>
        <button className="rounded-full bgColorGray aspect-square px-2 " onClick={(e) => increaseQuantity(e, index)}>+</button>
      </div>
        {quantity !== null ? quantity : "⊠"}
    </div>
  );
};

export const VariantsForm = ({ selectedPills, setSelectedPills, productData }) => {

  const [showSizeInput, setShowSizeInput] = useState(false);
  const [showColorInput, setShowColorInput] = useState(false);
  const [sizeValues, setSizeValues] = useState([]);
  const [colorValues, setColorValues] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(productData ? true : false);

  const deleteItem = (index) => {
    const updatedPills = selectedPills.filter((_, i) => i !== index);
    setSelectedPills(updatedPills);
  };
  const cancel = () => {
    setShowSizeInput(false);
    setShowColorInput(false);
  }
  const clearAll = () => {
    setSizeValues([]);
    setColorValues([]);
    setSelectedPills([]);
    setHasSubmitted(false);
  }
  const handleSubmitVariants = (e) => {
    e.preventDefault();
    if (showSizeInput && showColorInput) {
      let pills = sizeValues.map((size) =>
        colorValues.map((color) => ({ name: `${size}/${color}`, size, color, quantity: 1 }))
      );
      setSelectedPills(pills.flat());
      setShowSizeInput(false);
      setShowColorInput(false);
    } else if (showSizeInput) {
      setSelectedPills(sizeValues.map((size) => ({ size, quantity: 1 })));
      setShowSizeInput(false);
    } else if (showColorInput) {
      setSelectedPills(colorValues.map((color) => ({ color, quantity: 1 })));
      setShowColorInput(false);
    } else {
      setShowSizeInput(false);
      setShowColorInput(false);
    }
    setHasSubmitted(true);
  };

  const infiniteQuantity = (e, index) => {
    e.preventDefault();
    setSelectedPills(prev => prev.map((pill, i) => {
      if(i === index) {
        return {
          ...pill,
          quantity: null
        }
      }
      return pill
    }))
  }
  const decreaseQuantity = (e, index) => {
    e.preventDefault();
    console.log("selectedPills[index].quantity", selectedPills[index].quantity);
    if(!selectedPills[index].quantity || selectedPills[index].quantity === 0 ) return
    setSelectedPills(prev => prev.map((pill, i) => {
      if(i === index) {
        return {
          ...pill,
          quantity: pill.quantity - 1
        }
      }
      return pill
    }))
    console.log("decreased");
  }
  const increaseQuantity = (e, index) => {
    e.preventDefault();
    setSelectedPills(prev => prev.map((pill, i) => {
      if(i === index) {
        return {
          ...pill,
          quantity: pill.quantity ? pill.quantity + 1 : 1
        }
      }
      return pill
    }));
  }

  return(
    <div className="relative mb-4 border-2 border-gray-300 rounded p-2 ">
      <label className="block text-lg font-semibold mb-2">
        Filter by Variants
      </label>
      {(showSizeInput || showColorInput) &&
        <button className="absolute top-2 right-2" onClick={cancel}>X</button>
      }
      <div className="flex space-x-4 mb-2 ">
        <div
          className={`cursor-pointer p-2 border rounded ${
            showSizeInput ? "border-blue-500" : "border-gray-300"
          }`}
          onClick={() => {
            setShowSizeInput(!showSizeInput);
            setShowColorInput(false);
          }}
        >
          Size
        </div>
        <div
          className={`cursor-pointer p-2 border rounded ${
            showColorInput ? "border-blue-500" : "border-gray-300"
          }`}
          onClick={() => {
            setShowColorInput(!showColorInput);
            setShowSizeInput(false);
          }}
        >
          Color
        </div>
        <div
          className={`cursor-pointer p-2 border rounded ${
            showSizeInput && showColorInput
              ? "border-blue-500"
              : "border-gray-300"
          }`}
          onClick={() => {
            setShowSizeInput(true);
            setShowColorInput(true);
          }}
        >
          Size & Color
        </div>
      </div>
      {showSizeInput && (
        <div className="mb-2">
          <label className="block font-semibold mb-1">Size</label>
          <input
            type="text"
            placeholder="Size"
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                e.preventDefault();
                setSizeValues([...sizeValues, e.target.value]);
                e.target.value = "";
              }
            }}
          />
          <div className="mt-2 flex flex-col gap-1">
            {sizeValues.map((value, index) => (
              <div
                key={index}
                className="flex justify-between items-center border rounded px-2 py-1 productCardBg"
              >
                {value}
                <button
                  className="text-red-600"
                  onClick={(e) => {
                    e.preventDefault();
                    const updatedValues = sizeValues.filter(
                      (_, i) => i !== index
                    );
                    setSizeValues(updatedValues);
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showColorInput && (
        <div className="mb-2">
          <label className="block font-semibold mb-1">Color</label>
          <input
            type="text"
            placeholder="Color"
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                e.preventDefault();
                setColorValues([...colorValues, e.target.value]);
                e.target.value = "";
              }
            }}
          />
          <div className="mt-2 flex flex-col gap-1">
            {colorValues.map((value, index) => (
              <div
                key={index}
                className="flex justify-between items-center border rounded px-2 py-1 productCardBg"
              >
                {value}
                <button
                  className="text-red-600"
                  onClick={() => {
                    const updatedValues = colorValues.filter(
                      (_, i) => i !== index
                    );
                    setColorValues(updatedValues);
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {showSizeInput || showColorInput ? (
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer"
          onClick={(e) => handleSubmitVariants(e)}
        >
          Check
        </button>
      ) : null}
      {hasSubmitted && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedPills.map((pill, index) => (
            <PillVariant
              key={
                (pill.size && pill.color && `${pill.size}/${pill.color}`) ||
                (pill.size && `${pill.size}`) ||
                (pill.color && `${pill.color}`)
              }
              size={pill.size || null}
              color={pill.color || null}
              index={index}
              deleteItem={deleteItem}
              decreaseQuantity={decreaseQuantity}
              increaseQuantity={increaseQuantity}
              infiniteQuantity={infiniteQuantity}
              quantity={pill.quantity}
            />
          ))}
          {selectedPills.length > 0 && (
            <button onClick={clearAll} >Clear All</button>
          )}
        </div>
      )}
    </div>
  )
}

const UpdateProductForm = ({ categoriesData, productData }) => {
  const productCategoriesIds = productData?.categories?.map(
    (category) => category.id
  );
  const productDataVariants = productData?.productVariants?.map((variant) => ({
    size: variant.name,
    quantity: variant.quantity,
  }));
  const productImages = productData?.imageUrls

  const [prevImages, setPrevImages] = useState(productImages || []);
  const [images, setImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [imageError, setImageError] = useState("");

  const [form, setForm] = useState({
    name: productData?.name || "",
    excerpt: productData?.excerpt || "",
    description: productData?.description || "",
    collection: productData?.collection || "",
    state: productData?.state || "Available",
    categories: productCategoriesIds || [],
  });
  const [price, setPrice] = useState(productData?.price || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  
  const [selectedPills, setSelectedPills] = useState(productDataVariants || []); // Variants State 
  console.log("selectedPills: ", selectedPills); 
  useEffect(() => {
    const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
    if(isDarkModeLocal) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, []);

  const handleImageUpload = (event) => {
    const newImages = Array.from(event.target.files);

    const invalidFiles = newImages.filter(
      (file) => file.type.indexOf("image/") !== 0
    );

    if (invalidFiles.length > 0) {
      setImageError("Invalid file format. Please upload images only.");
      return;
    }

    setImageError("");
    setImages([...images, ...newImages]);
  };


  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };
  const handleRemovePrevImage = (index) => {
    setRemovedImages((prev) => {
      return ([...prev, prevImages[index]]);
    });
    const updatedImages = prevImages.filter((_, i) => i !== index);
    setPrevImages(updatedImages);
  };
  const handleAddPrevImage = (index) => {
    setPrevImages(prev => [...prev, removedImages[index]]);
    setRemovedImages(prev => prev.filter((_, i) => i !== index));
  };

  const deletaImagesFromFireBase = async () => {
    removedImages.map((image) => {
      try{
        const imageRef = ref(storage, image.url);
        deleteObject(imageRef); //add await? (also async next to (image) )
      }
      catch(error){
        console.log(error.message);
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const categoryOptions = categoriesData.map((category) => {
    return { value: category.id, label: category.name };
  });

  const handleCategoryChange = (selectedOptions) => {
    const selectedCategories = selectedOptions.map((option) => option.value);
    setForm((prevForm) => ({ ...prevForm, categories: selectedCategories }));
  };

  async function uploadImage(image) {
    const storageRef = ref(
      storage,
      `/products/${form.name}/${Date.now()}-${image.name}`
    );

    const response = await uploadBytes(storageRef, image);
    const url = await getDownloadURL(response.ref);
    return url;
  }
  async function uploadImages() {
    const imagePromises = Array.from(images, (image) => uploadImage(image));

    const imageRes = await Promise.all(imagePromises);
    return imageRes; // list of url like ["https://..", ...]
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const imgUrls = await uploadImages();
    const imageUrls = imgUrls.map((url) => ({ url }))
    await deletaImagesFromFireBase();
    const previousVariants = productData?.productVariants.map((variant) => (
      {id: variant.id}
    ));
    const removedImagesIds = removedImages.map((image) => image.id).flat();
    const updatedProduct = await updateProduct({
      productId: productData.id,
      ...form,
      price,
      variants: selectedPills,
      imageUrls,
      removedImagesIds,
      previousCategories: productCategoriesIds.map((id) => ({ id })),
      previousCollections: [],
      previousVariants,
      
    });
    await publishProduct(updatedProduct.updateProduct.id);
    await publishImagesUrls(updatedProduct.updateProduct.imageUrls);
    await publishProductVariants(updatedProduct.updateProduct.productVariants);
    setIsSubmitting(false);
    router.push(`/itemsDetails/${updatedProduct.updateProduct.id}`);
  };
  

  return (
    <div className="max-w-2xl h-screen mx-auto p-6 bgColor colorScheme rounded-lg fontColor overflow-y-scroll pb-16">
      <h2 className="text-3xl font-semibold mb-6">Update Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-4">
          <label htmlFor="images" className="block text-lg font-semibold mb-2">
            Images
          </label>
          <input
            type="file"
            id="images"
            required={images.length === 0 && prevImages.length === 0}
            multiple
            onChange={handleImageUpload}
            className="py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          />
          {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
          <div className="flex space-x-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={ URL.createObjectURL(image) }
                  alt={`Product ${index}`}
                  className="w-32 h-32 object-cover rounded"
                />
                <span
                  className="absolute top-0 right-0 text-white bg-red-500 rounded-full p-1 cursor-pointer"
                  onClick={() => handleRemoveImage(index)}
                >
                  X
                </span>
              </div>
            ))}
            {prevImages.map((image, index) => (
              <div key={image.url} className="relative ">
                <img
                  src={ image.url }
                  alt={`Product ${index}`}
                  className="w-32 h-32 object-cover rounded "
                />
                <span
                  className="absolute top-0 right-0 text-white bg-red-500 rounded-full p-1 cursor-pointer"
                  onClick={() => handleRemovePrevImage(index)}
                >
                  X
                </span>
              </div>
            ))}
            {removedImages.map((image, index) => (
              <div key={image.url} className="relative">
                <img
                  src={ image.url }
                  alt={`Product ${index}`}
                  className="w-32 h-32 object-cover rounded brightness-50"
                />
                <span
                  className="absolute top-0 right-0 text-white bg-blue-500 rounded-full p-1 cursor-pointer"
                  onClick={() => handleAddPrevImage(index)}
                >
                  +
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block text-lg font-semibold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="excerpt" className="block text-lg font-semibold mb-2">
            Excerpt
          </label>
          <input
            type="text"
            id="excerpt"
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-lg font-semibold mb-2"
          >
            Description (Markdown)
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
            rows="6"
          />
          <ReactMarkdown className="prose mt-2">
            {form.description}
          </ReactMarkdown>
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-lg font-semibold mb-2">
            Price
          </label>
          <div className="flex items-center border rounded focus-within:border-blue-500">
            <span className="text-gray-600 px-3">$</span>
            <input
              type="number"
              id="price"
              required
              name="price"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              className="w-full py-2 px-2 rounded focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>
          {/* {isNaN(parseFloat(form.price)) && form.price.trim() !== '' && (
            <p className="text-red-500 text-sm mt-1">Please enter a valid price.</p>
          )} */}
        </div>
        <div className="mb-4">
          <label
            htmlFor="categories"
            className="block text-lg font-semibold mb-2"
          >
            Categories
          </label>
          <Select
            id="categories"
            name="categories"
            isMulti
            options={categoryOptions}
            value={categoryOptions.filter((option) =>
              form.categories.includes(option.value)
            )}
            onChange={handleCategoryChange}
            className="py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          />
        </div>
        <VariantsForm selectedPills={selectedPills} setSelectedPills={setSelectedPills} productData={productData} />

        <div className="mb-4">
          <label
            htmlFor="collection"
            className="block text-lg font-semibold mb-2"
          >
            Collection
          </label>
          <select
            id="collection"
            name="collection"
            value={form.collection}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="">Select a Collection</option>
            {/* Add collection options here */}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="state" className="block text-lg font-semibold mb-2">
            State
          </label>
          <select
            id="state"
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
          >
            <option value="Available">Available</option>
            <option value="Out Of Stock">Out Of Stock</option>
            <option value="Removed">Removed</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-3 px-6 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:border-blue-500"
        >
          {isSubmitting ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default UpdateProductForm;
