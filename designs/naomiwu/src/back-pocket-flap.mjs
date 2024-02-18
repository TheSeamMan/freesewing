import { backPocket } from './back-pocket.mjs'

/*
 * This is the exported part object
 */
export const backPocketFlap = {
  name: 'naomiwu.backPocketFlap', // The name in design::part format
  draft: draftBackPocketFlap, // The method to call to draft this part
  from: backPocket, // Draft this part starting from the (imported) `backPocket` part
}

/*
 * This function drafts the back pocket flap of the skirt
 */
function draftBackPocketFlap({ Point, points, paths, store, part, sa, snippets, Snippet, macro }) {
  /*
   * Clean up what we don't need from the backPocket part
   */
  delete paths.pocket
  macro('rmvd', 'height')
  macro('rmhd', 'width')
  macro('rmhd', 'wChamfer')
  macro('rmvd', 'hChamfer')

  /*
   * The seam line
   */
  paths.seam = paths.flap.clone().setClass('fabric')
  paths.flap.hide()

  /*
   * Only add SA when it's requested
   */
  if (sa) paths.sa = paths.seam.offset(sa).attr('class', 'fabric sa')

  /*
   * Annotations
   */

  // Cutlist
  store.cutlist.setCut({ cut: 2, from: 'fabric' })

  /*
   * Add the title
   */
  points.title = points.pocketTopLeft.shiftFractionTowards(points.flapBottomLeft, 0.6).shift(0, 20)
  macro('title', {
    at: points.title,
    nr: 11,
    title: 'backPocketFlap',
    scale: 0.7,
  })

  /*
   * Add the logo
   */
  points.logo = points.title.shift(0, 70)
  snippets.logo = new Snippet('logo', points.logo).scale(0.5)

  /*
   * Add a grainline indicator
   */
  points.grainlineBottom = points.flapBottomLeft.shift(0, 10)
  points.grainlineTop = new Point(points.grainlineBottom.x, points.flapTopRight.y)
  macro('grainline', {
    from: points.grainlineBottom,
    to: points.grainlineTop,
  })

  /*
   * Dimensions
   */
  macro('vd', {
    id: 'leftHeight',
    from: points.flapBottomLeft,
    to: points.flapTopLeft,
    x: points.flapTopLeft.x - sa - 15,
  })
  macro('vd', {
    id: 'rightHeight',
    from: points.flapBottomRight,
    to: points.flapTopRight,
    x: points.flapTopRight.x + sa + 15,
  })
  macro('hd', {
    id: 'width',
    from: points.flapTopLeft,
    to: points.flapTopRight,
    y: points.flapTopRight.y - sa - 15,
  })

  return part
}
