'use strict'

module.exports = ({ CategoryRepository, TC }) => {
  const {
    schemaComposer,
    TypeComposer
  } = TC

  const CategoryTC = TypeComposer.create({
    name: 'CategoriesType',
    fields: {
      id: 'ID!',
      count: 'Int',
      description: 'String',
      link: 'String',
      name: 'String',
      slug: 'String',
      taxonomy: 'String',
      parent: 'Int',
      meta: ['String']
    }
  })

  CategoryTC.addResolver({
    name: 'getCategories',
    args: {},
    type: [CategoryTC],
    resolve: ({ source, args }) => {
      return CategoryRepository.getCategories()
    }
  })

  CategoryTC.addResolver({
    name: 'getCategoryByID',
    args: { id: 'ID' },
    type: CategoryTC,
    resolve: ({ source, args }) => {
      return CategoryRepository.getCategoryByID(args.id)
    }
  })

  CategoryTC.addResolver({
    name: 'getCategoriesByPostId',
    args: { id: 'ID' },
    type: [CategoryTC],
    resolve: ({ source, args }) => {
      return CategoryRepository.getCategoriesByPostId(args.id)
    }
  })

  schemaComposer.rootQuery().addFields({
    getCategories: CategoryTC.getResolver('getCategories'),
    getCategoryByID: CategoryTC.getResolver('getCategoryByID'),
    getCategoriesByPostId: CategoryTC.getResolver('getCategoriesByPostId')
  })

  TC.CategoriesTC = CategoryTC

  return CategoryTC
}
