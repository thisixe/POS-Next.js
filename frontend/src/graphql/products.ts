import { gql } from '@apollo/client';

export const GET_HOME_DATA = gql`
  query GetHomeData {
    categories {
      id
      name
      nameEn
      slug
      image
      productCount
    }
    products(featured: true, limit: 8) {
      products {
        id
        name
        nameEn
        slug
        price
        discountPrice
        images
        stock
        featured
      }
      total
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($category: String, $search: String, $featured: Boolean, $limit: Int, $offset: Int) {
    products(category: $category, search: $search, featured: $featured, limit: $limit, offset: $offset) {
      products {
        id
        name
        nameEn
        slug
        category {
          id
          name
          nameEn
          slug
        }
        price
        discountPrice
        images
        stock
        featured
      }
      total
      hasMore
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($slug: String!) {
    product(slug: $slug) {
      id
      name
      nameEn
      slug
      description
      descriptionEn
      price
      discountPrice
      brand
      images
      stock
      featured
      category {
        id
        name
        nameEn
        slug
      }
      specifications {
        key
        value
      }
    }
  }
`;
