import { request, gql } from 'graphql-request';
const graphqlAPI = process.env.GRAPHYL_ENDPOINT;

export const getProducts = async (cursor, searchText, category, isAdmin) => {
  const querySearchtext = searchText ? searchText : ""; 
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
            images {
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
  const result = await request(graphqlAPI, query, { cursor, querySearchtext, category });
  console.log("result: ", result);
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
  console.log("result: ", result);
  return result.product;
};

export const submitComment = async (comment) => {
  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( comment ),
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
export const updateTheUser = async (userId, updatedDetails, profileImageUrl) => { 
  console.log("Update The User");
  // const query = prevImage?.url === image?.url
  
  try {
    const response = await fetch('/api/updateUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( {userId, ...updatedDetails, profileImageUrl} ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
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