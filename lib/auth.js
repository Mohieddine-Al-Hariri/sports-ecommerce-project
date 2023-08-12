import NextAuth from "next-auth/next";
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from 'next-auth/providers/facebook'
import { v4 as uuidv4 } from 'uuid';
import { GraphQLClient, gql } from "graphql-request";
import { compare, hash } from "bcrypt";

const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
  },
});

const GetUserByPhoneNumber = gql`
  query GetUserByPhoneNumber($countroCodePhoneNumber: String!) {
    user: theUsers(where: { countroCodePhoneNumber: $countroCodePhoneNumber }, stage: DRAFT) { 
      id
      password
      slug
      firstName
      lastName
      email
      profileImageUrl
      userRole {
        role
      } 
      phoneNumber
    }
  }
`;// You can get more field/properties from here

const GetUserByEmail = gql`
  query GetUserByEmail($email: String!) {
    user: theUsers(where: { email: $email }, stage: DRAFT) { 
      id
      firstName
      lastName
      slug
      email
      profileImageUrl
      userRole {
        role
      }
      phoneNumber
    }
  }
`;
// countryCode
// phoneNumber

//TODO: add birthDate
const CreateTheUser = gql`
  mutation CreateTheUser($firstName: String!, $lastName: String!, $password: String!, $slug: String!, $phoneNumber: String!) {
    newUserCart: createCart(
      data: {theUser: {create: {firstName: $firstName, lastName: $lastName, password: $password, phoneNumber: 10, slug: $slug, userRole: {connect: {id: "clkwj8n4g5z3n0bujxk2vfqpd"}}}}}
    ) {
      theUser {
        id
        slug
        firstName
        lastName
        phoneNumber
        profileImageUrl
        userRole {
          role
        }
      }
      id
    }
  }
`;

//directly create user, instead from inside createCart, using phoneNumber
// const CreateTheUser = gql`
//   mutation CreateTheUser($firstName: String!, $lastName: String!, $password: String!, $slug: String!, $phoneNumber: String!) {
//     newUser: createTheUser(data: { firstName: $firstName, lastName: $lastName,  password: $password, slug: $slug, userRole: {connect: {id: "clkwj8n4g5z3n0bujxk2vfqpd"}}, phoneNumber: $phoneNumber }) {
//       id
//       slug
//       firstName
//       lastName
//       phoneNumber
//       password
//       profileImageUrl
//       userRole{
//         role
//       }
//     }
//   }
// `;
const publishUser = gql`
  mutation PublishUser($slug: String!) {
    publishTheUser(where: {slug: $slug}) {
      slug
    }
  }
`;

const CreateUserByEmailPass = gql`
  mutation CreateTheUser($email: String!, $firstName: String!, $lastName: String!, $slug: String!, $profileImageUrl: String! ) {
    newUserCart: createCart(
      data: {theUser: {create: {firstName: $firstName, lastName: $lastName, slug: $slug, userRole: {connect: {id: "clkwj8n4g5z3n0bujxk2vfqpd"}}, email: $email, profileImageUrl: $profileImageUrl}}}
    ) {
      theUser {
        id
        slug
        firstName
        lastName
        email
        profileImageUrl
        userRole {
          role
        }
      }
      id
    }
  }
`;
//directly create user, instead from inside createCart, using email
// const CreateUserByEmailPass = gql`
//   mutation CreateTheUser($email: String!, $firstName: String!, $lastName: String!, $slug: String!, $profileImageUrl: String! ) {
//     newUser: createTheUser(data: { email: $email, firstName: $firstName, lastName: $lastName, profileImageUrl: $profileImageUrl, slug: $slug, userRole: {connect: {id: "clkwj8n4g5z3n0bujxk2vfqpd"}} }) {
//       id
//       slug
//       firstName
//       lastName
//       email
//       profileImageUrl
//       userRole{
//         role
//       }
//     }
//   }
// `;


export const authOptions = {  

  session: {
    strategy : 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      async profile(profile) {
        // console.log("profile: ", profile)
        const { user } = await client.request(GetUserByEmail, { email: profile.email });
        console.log("\nuser__________\n\n", user);
        if (!user || user?.length === 0) {
          // console.log("profile: ", profile)
          console.log("---------------------------------------user not found");
          const slug = uuidv4();
          const { newUserCart } = await client.request(CreateUserByEmailPass, {
            // id: newUser.id,
            slug,
            email: profile.email,
            //password: await hash(user.password, 12),
            photo: profile.picture,
            profileImageUrl: profile.picture,
            firstName: profile.given_name,
            lastName: profile.family_name,
            birthDate: profile.birthday
          });
          await client.request(publishUser, {slug});
          console.log("_____newUserCart: ", newUserCart)
          const newUser = newUserCart.theUser;
          return {
            id: newUser.id,
            user: {
              id: newUser.id,
              firstName: profile.given_name,
              lastName: profile.family_name,
              email: newUser.email,
              slug: newUser.slug,
              profileImageUrl: newUser.profileImageUrl,
              userRole: newUser.userRole.role
            }
          };
        }

        //TODO: Make it more secure??
        // console.log("user[0]: ", user[0])

        return {
          name: user[0].firstName,
          id: user[0].id,
          user: {
            id: user[0].id,
            firstName: user[0].firstName,
            lastName: user[0].lastName,
            email: user[0].email,
            slug: user[0].slug,
            profileImageUrl: user[0].profileImageUrl,
            countryCode: +user[0].phoneNumber?.substring(0, user[0].phoneNumber.indexOf('_')),
            phoneNumber: user[0].phoneNumber?.slice(user[0].phoneNumber.indexOf('_') + 1),
            userRole: user[0].userRole.role,
            countryCodePhoneNumber: user[0].phoneNumber,
            birthDate: user[0].birthDate  
          }
        };
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET
      // clientSecret: process.env.FACEBOOK_CLIENT_TOKEN
    }),
    CredentialsProvider({
      name: 'Phone Number',
      credentials : {
        countryCode: {
          label: 'Country Code',
          type: 'number',
        },
        phoneNumber: {
          label: 'Phone Number',
          type: 'number',
          placeholder: '1112223'
        },
        password: {
          label: 'Password',
          type: 'password'
        },
        firstName: {
          label: 'First Name',
          type: 'text'
        },
        lastName: {
          label: 'Last Name',
          type: 'text'
        },
      },
      authorize: async (credentials) => {
        const { phoneNumber, password, countryCode, firstName, lastName, isLogIn, ph, birthDate } = credentials
        const countryPhoneNumber = ph;
        // const countryPhoneNumber = `${countryCode.slice(1)}_${phoneNumber}`;
        // console.log("credentials: ", credentials)
        const { user } = await client.request(GetUserByPhoneNumber, {
          countroCodePhoneNumber: countryPhoneNumber,
          // countryCode: countryCode.slice(1),
        });
        // console.log("__________________-user: ", user)
        if(isLogIn === 'true' && (user.length === 0 || !user )){
          throw new Error("Account not found! Sign-Up Instead");
        }
        if ( isLogIn === "false" && (!user || user.length === 0)) {
          const slug = uuidv4();
          const hashedPassword = await hash(password, 12)
          const { newUserCart } = await client.request(
            CreateTheUser,
            {
              // phoneNumber: +phoneNumber,
              password: hashedPassword,
              firstName,
              lastName,
              // countryCode: countryCode.slice(1),
              slug,
              phoneNumber: countryPhoneNumber,
              birthDate
            }
          );
          await client.request(publishUser, {slug});
          const newUser = newUserCart.theUser;
          return {
            id: newUser.id,
            user: {
              id: newUser.id,
              name: firstName,
              lastName,
              countryCode: +newUser.phoneNumber.substring(0, newUser.phoneNumber.indexOf('_')),
              phoneNumber: newUser.phoneNumber.slice(newUser.phoneNumber.indexOf('_') + 1), //TODO: Pass Something Else? or make it hidden on preference
              countryCodePhoneNumber: phoneNumber,
              slug,
              birthDate: newUser.birthDate,
              userRole: newUser.userRole.role,
            }
          };
        }
        // console.log("---------------------------------------user found: ", user);
        // console.log("---------------------------------------user.password: ", user[0].password);
        const isValid = await compare(password, user[0].password);
      
        if (!isValid) {
          throw new Error("Wrong credentials. Try again.");
        }
        const { id, slug, userRoles, countroCodePhoneNumber, profileImageUrl } = user[0];
        // console.log("sec")
        return {
          user: {
            id,
            name: user[0].firstName,
            firstName: user[0].firstName,
            lastName: user[0].lastName,
            birthDate: user[0].birthDate,
            countryCode: +countroCodePhoneNumber.substring(0, countroCodePhoneNumber.indexOf('_')),
            phoneNumber: +countroCodePhoneNumber.slice(countroCodePhoneNumber.indexOf('_') + 1),
            slug,
            userRole: userRoles.role,
            countryCodePhoneNumber: countroCodePhoneNumber,
            profileImageUrl,
          }
        }
        
      },
    }),
  ],
  //TODO:
  // jwt: {
  //   encode: ({ secret, token }) => {
  //     const encodedToken = jsonwebtoken.sign(
  //       {
  //         ...token,
  //         iss: "grafbase",
  //         exp: Math.floor(Date.now() / 1000) + 60 * 60,
  //       },
  //       secret
  //     );
      
  //     return encodedToken;
  //   },
  //   decode: async ({ secret, token }) => {
  //     const decodedToken = jsonwebtoken.verify(token, secret);
  //     return decodedToken;
  //   },
  // },

  callbacks: {
    async jwt({token, user, trigger, session}) {
      // console.log("token in jwt: ", token, user)
      if(trigger === "update"){
        // console.log("triggered", session)
        token.user = session?.user
        return token
      }
      return { ...token, ...user }
    },
    async session({session, token}) {
      // console.log("session in session: ", session)
      // console.log(token)
      session.user = token.user;
      return session
    },

  },
  pages: {
    signIn: "/SignIn",
  },
}
export default NextAuth(authOptions)
  
  