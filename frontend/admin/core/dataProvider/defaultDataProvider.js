export default {
  create: () => Promise.resolve({ data: null }), // avoids adding a context in tests
  delete: () => Promise.resolve({ data: null }), // avoids adding a context in tests
  getList: () => Promise.resolve({ data: [], total: 0 }), // avoids adding a context in tests
  getOne: () => Promise.resolve({ data: null }), // avoids adding a context in tests
  update: () => Promise.resolve({ data: null }), // avoids adding a context in tests
};
