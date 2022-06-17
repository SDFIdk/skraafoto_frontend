import {get} from 'skraafoto-saul'
import create from 'zustand'

get()
.then((data) => {
  console.log(data)
})

const store = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}))

export default store