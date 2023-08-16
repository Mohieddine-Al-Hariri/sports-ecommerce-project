import { request, gql } from 'graphql-request';
const graphqlAPI = process.env.GRAPHYL_ENDPOINT;
const graphqlPublicAPI = process.env.NEXT_PUBLIC_GRAPHYL_ENDPOINT;

export const getTheUser = async ( slug ) => {
  const query = gql`
    query TheUser($slug: String!) {
      theUser(where: {slug: $slug}) {
        firstName
        lastName
        id
        email
        phoneNumber
        birthDate
        slug
        profileImageUrl
        location
        cart {
          id
        }
        orderItems {
          product {
            slug
            price
            id
            images {
              url
              size
            }
          }
        }
      }
    }
  `;
  const result = await request(graphqlAPI, query, { slug });
  return result.theUser;
}
export const publishUser = async (userSlug) => {
  try {
    const response = await fetch('/api/publishUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( userSlug ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const updateTheUser = async (updatedDetails) => { 
  try {
    const response = await fetch('/api/updateUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( updatedDetails ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getProducts = async (cursor, searchText, category, isAdmin) => {
  //TODO: Add rating for each product and comments
  //TODO: add pagination using cursor
  const querySearchtext = searchText ? searchText : ""; 
  console.log("querySearchtext: ", querySearchtext);
  // const getPublished = !isAdmin ? ", isPublished: true" : "";
  // const categoryQuery = category ? `, categories_every: {name: $category}` : "";
  const getPublished =  "";
  const categoryQuery = "";

  const query = gql`
  query MyQuery($querySearchtext: String, $cursor: String${category ? `, $category: String` : ""}) {
    productsConnection(first: 10, after: $cursor, where: {_search: $querySearchtext${getPublished}${categoryQuery}}, orderBy: createdAt_DESC) {
        edges {
          cursor
          node {
            collections {
              name
              slug
            }
            id 
            excerpt
            images {
              url
            }
            imageUrls(first: 1) {
              url
            }
            name
            price
            slug
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;
  const result = await request(graphqlPublicAPI, query, { cursor, querySearchtext, category });
  console.log("result: ", result.productsConnection.edges);
  return {
    products: result.productsConnection.edges,
    pageInfo: {
      ...result.productsConnection.pageInfo
    },
  };
};
export const getProductDetails = async (productId) => { //TODO: Get using Slug if possible
  const query = gql`
    query GetProductDetails($productId : ID!) {
      product(where: {id: $productId}) {
        id
        name
        price
        publishedBy {
          name
          id
          picture
        }
        images {
          url
        }
        imageUrls {
          url
        }
        slug
        updatedAt
        variants {
          ... on ProductColorVariant {
            id
            name
            color
          }
          ... on ProductSizeColorVariant {
            id
            name
            color
            size
          }
          ... on ProductSizeVariant {
            id
            name
            size
          }
        }
        collections {
          slug
          name
          products(first: 3) {
            images {
              url
            }
            slug
            name
          }
        }
      }
    }
  `;

  const result = await request(graphqlAPI, query, { productId });
  // console.log("result: ", result);
  return result.product;
};
export const createProduct = async (productDetails) => {
  try {
    const response = await fetch('/api/createProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( productDetails ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishImagesUrls = async (imagesUrls) => {
  try {
    const response = await fetch('/api/publishImageUrl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( imagesUrls ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishProduct = async (productId) => {
  try {
    const response = await fetch('/api/publishProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( productId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateProduct = async (productDetails) => {
  try {
    const response = await fetch('/api/updateProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( productDetails ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const updateProductState = async (product) => {
  try {
    const response = await fetch('/api/updateProductState', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( product ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
// export const getCartItems = async (cursor, searchText, userId, isAdmin) => {
//   //TODO: add pagination using cursor?
//   const querySearchtext = searchText ? searchText : ""; 
//   // const getPublished = !isAdmin ? ", isPublished: true" : "";
//   // const getPublished =  "";
//   console.log(cursor, searchText, userId)
//   const query = gql`
//     query MyQuery ($querySearchtext: String, ${cursor  ? "$cursor: String, " : ""} $userId: ID){
//       orderItemsConnection(
//         first: 10
//         orderBy: createdAt_DESC
//         where: {theUser: {id: $userId}, _search: $querySearchtext}
//       ) {
//         pageInfo {
//           hasNextPage
//         }
//         edges {
//           cursor
//           node {
//             createdAt
//             quantity
//             total
//             product {
//               images {
//                 url
//               }
//               excerpt
//               id
//               name
//               price
//               slug
//               variants {
//                 ... on ProductSizeColorVariant {
//                   id
//                   name
//                 }
//               }
//             }
//             id
//           }
//         }
//       }
//     }
//   `;
//   const result = await request(graphqlAPI, query, { cursor, querySearchtext, userId });
//   // console.log("result: ", result);
//   return {
//     products: result.orderItemsConnection.edges,
//     pageInfo: {
//       ...result.orderItemsConnection.pageInfo
//     },
//   };
// };

export const getOrders = async (cursor, searchText, userId, isAdmin) => {
  //TODO: add tracking functionality
  //TODO: add pagination using cursor?
  const querySearchtext = searchText ? searchText : ""; 
  // const getPublished = !isAdmin ? ", isPublished: true" : "";
  // const getPublished =  "";
  console.log(cursor, searchText, userId)
  const query = gql`
  query Orders(${cursor ? `$cursor: String, ` : ""}$querySearchtext: String, $userId: ID) {
    ordersConnection(first: 10, where: {theUser: {id: $userId}, _search: $querySearchtext, isRemoved_not: true}, orderBy: createdAt_DESC) {
      edges {
        cursor
        node {
          id
          createdAt
          total
          state
          orderItems(first: 1) {
            id
            quantity
            total
            product {
              name
              imageUrls(first: 1) {
                url
              }
              images {
                url
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
  
  `;
  const result = await request(graphqlAPI, query, { cursor, querySearchtext, userId });
  console.log("result: ", result);
  return {
    orders: result.ordersConnection.edges,
    pageInfo: {
      ...result.ordersConnection.pageInfo
    },
  };
};
export const getAdminOrders = async (cursor, searchText, stateFilter) => {
  //TODO: add tracking functionality...
  //TODO: add pagination using cursor?
  //Make Location as a longitude and latitude??
  const querySearchtext = searchText ? searchText : ""; 
  // const queryCursor = cursor ? cursor : ""; 
  console.log(cursor, searchText)
  const query = gql`
    query Orders($cursor: String, $querySearchtext: String) {
      ordersConnection(first: 10, after: $cursor, where: {_search: $querySearchtext}, orderBy: createdAt_DESC) {
        edges {
          cursor
          node {
            id
            state
            createdAt
            total
            theUser{
              id
              slug
              firstName
              lastName
              email
              location
            }
            orderItems(first: 3) {
              id
              quantity
              total
              product {
                name
                imageUrls(first: 1) {
                  url
                }
                images {
                  url
                }
              }
            }
            
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;
  const result = await request(graphqlPublicAPI, query, { cursor, querySearchtext });
  // console.log("result: ", result);
  return {
    orders: result.ordersConnection.edges,
    pageInfo: {
      ...result.ordersConnection.pageInfo
    },
  };
};
export const submitOrder = async (order) => {
  try {
    const response = await fetch('/api/submitOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( order ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateOrderState = async (updatedDetails) => {
  try {
    const response = await fetch('/api/changeOrderState', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( updatedDetails ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const removeOrder = async (orderId) => {
  try {
    const response = await fetch('/api/removeOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( orderId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const getOrderDetails = async (orderId) => {
  const query = gql`
    query Orders($orderId: ID) {
      order(where: {id: $orderId}) {
        id
        isRemoved
        state
        total
        theUser {
          location
          phoneNumber
          email
          firstName
          lastName
        }
        orderItems {
          id
          variant
          product {
            excerpt
            id
            imageUrls {
              url
            }
            images {
              url
            }
            name
            price
            slug
            variants {
              ... on ProductColorVariant {
                id
                name
                color
              }
              ... on ProductSizeColorVariant {
                id
                name
                color
                size
              }
            }
          }
          quantity
          total
        }
      }
  }
  `;

  const result = await request(graphqlAPI, query, { orderId });
  // console.log("result: ", result);
  return result.order;
};


export const getCart = async (searchText, cartId, isAdmin) => {
  //TODO: add pagination using cursor?, then need to use orderItemsConnection instead of cart....
  const querySearchtext = searchText ? searchText : ""; 
  // const getPublished = !isAdmin ? ", isPublished: true" : "";
  // const getPublished =  "";
  console.log(searchText, cartId)
  const query = gql`
    query Cart($cartId: ID, $querySearchtext: String) {
      cart(where: {id: $cartId}) {
        orderItems(where: {_search: $querySearchtext}) {
          id
          quantity
          total
          variant
          product {
            id
            imageUrls(first: 1) {
              url
            }
            images(first: 1) {
              url
            }
            name
            price
            slug
            variants {
              ... on ProductSizeColorVariant {
                id
                name
                color
                size
              }
            }
          }
        }
      }
    }
  `;
  const result = await request(graphqlAPI, query, { querySearchtext, cartId });
  console.log("result: ", result);
  return result.cart
};
export const addItemToCart = async (obj) => {
  try {
    const response = await fetch('/api/addToCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( obj ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const removeItemfromCart = async (itemId) => {
  try {
    const response = await fetch('/api/removeItemFromCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( itemId ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const disconnectItemfromCart = async (obj) => {
  try {
    const response = await fetch('/api/disconnectItemsfromCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( obj ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishCart = async (cartId) => {
  try {
    const response = await fetch('/api/publishCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( cartId ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishItemAddedToCart = async (itemId) => {
  try {
    const response = await fetch('/api/publishCartItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( itemId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

//TODO: Make the cart 2 way reference with user??

export const deletePost = async (slug) => {
  try {
    const response = await fetch('/api/deletePost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( slug ),
    });

    // if (!response.ok) {
    //   console.log("response", response.json())

    //   throw new Error('Failed to submit comment');
    // }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};