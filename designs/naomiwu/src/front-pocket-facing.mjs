import { frontPocketBag } from './front-pocket-bag.mjs'

/*
 * This is the exported part object
 */
export const frontPocketFacing = {
  name: 'naomiwu.frontPocketFacing', // The name in design::part format
  draft: draftFrontPocketFacing, // The method to call to draft this part
  from: frontPocketBag, // Draft this starting from the (imported) frontPocketBag part
}

/*
 * This function drafts the front pocket facing of the skirt
 */
function draftFrontPocketFacing({ points, Path, paths, store, part, sa, macro }) {
  /*
   * Clean up what we don't need
   */
  delete paths.pocketbagBoundary
  delete paths.pocketfacingBoundary
  macro('rmad') // Removes all dimensions

  /*
   * The seam line
   */
  paths.seam = new Path()
    .move(points.frontPocketBagStart)
    .line(points.frontPocketFacingCenter)
    .line(points.frontPocketFacingSide)
    .line(points.topRight)
    .join(paths.frontWaistSide)
    .line(points.frontPocketBagStart)
    .close()
    .addClass('fabric')

  /*
   * Only add SA when requested
   */
  if (sa) paths.sa = paths.seam.offset(sa).attr('class', 'fabric sa')

  /*
   * Fix text alignement on the side seam
   */
  paths.side = new Path()
    .move(points.frontPocketFacingSide)
    .line(points.topRight)
    .addClass('hidden')
    .addText('sideSeam', 'center fill-note text-sm')
    .attr('data-text-dy', -1)

  /*
   * Annotations
   */

  // Cutlist
  store.cutlist.setCut({ cut: 2, from: 'fabric', onFold: true })

  /*
   * Add the title ( and remove the inherited one)
   */
  macro('rmtitle')
  macro('title', {
    at: points.title,
    nr: 6,
    title: 'frontPocketFacing',
  })

  /*
   * Add cut-on-fold indicator
   */
  macro('cutonfold', {
    from: points.frontPocketBagStart,
    to: points.frontPocketFacingCenter,
    grainline: true,
  })

  /*
   * Dimensions
   */
  macro('hd', {
    id: 'wAtBottom',
    from: points.frontPocketFacingCenter,
    to: points.frontPocketFacingSide,
    y: points.frontPocketFacingCenter.y + sa + 15,
  })
  macro('hd', {
    id: 'wAtTop',
    from: points.frontPocketBagStart,
    to: points.topRight,
    y: points.topRight.y - sa - 15,
  })
  macro('vd', {
    id: 'hFull',
    from: points.frontPocketFacingCenter,
    to: points.frontPocketBagStart,
    x: points.frontPocketFacingCenter.x - sa - 15,
  })

  return part
}
