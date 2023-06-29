import { getWinningPost } from "./get-winning-post";

describe('get-winning-post', () => {
  test('majority', () => {
    expect(getWinningPost(1)).toBe(1)
    expect(getWinningPost(2)).toBe(2)
    expect(getWinningPost(3)).toBe(2)
    expect(getWinningPost(4)).toBe(3)
    expect(getWinningPost(5)).toBe(3)
    expect(getWinningPost(6)).toBe(4)
    expect(getWinningPost(7)).toBe(4)
    expect(getWinningPost(8)).toBe(5)
    expect(getWinningPost(9)).toBe(5)
    expect(getWinningPost(10)).toBe(6)
    expect(getWinningPost(11)).toBe(6)
  })
})
