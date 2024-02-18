import { frontBase } from './front-base.mjs'
import { capitalize } from '@freesewing/core'

/*
 * This is the exported part object
 */
export const waistband = {
  name: 'naomiwu.waistband', // The name in design::part format
  draft: draftWaistband, // The method to call to draft this part
  after: frontBase, // Draft this part starting from the (imported) frontBase part
}

/*
 * This function drafts the waistband of the skirt
 */
function draftWaistband({
  Point,
  points,
  Path,
  paths,
  store,
  part,
  options,
  complete,
  sa,
  snippets,
  Snippet,
  macro,
  absoluteOptions,
}) {
  /*
   * We start from center back and make our way towards the front in both directions
   */
  points.cbTop = new Point(0, 0)
  points.cbBottom = new Point(points.cbTop.x, absoluteOptions.waistbandWidth * 2)

  /*
   * First add the back parts
   */
  points.leftSideTop = points.cbTop.shift(180, store.get('backHipLength'))
  points.leftSideBottom = new Point(points.leftSideTop.x, points.cbBottom.y)
  points.rightSideTop = points.leftSideTop.flipX()
  points.rightSideBottom = points.leftSideBottom.flipX()

  /*
   * Now continue with the fronts
   */
  points.leftFrontTop = points.leftSideTop.shift(180, store.get('frontHipLength'))
  points.leftFrontBottom = new Point(points.leftFrontTop.x, points.cbBottom.y)
  points.rightFrontTop = points.leftFrontTop.flipX()
  points.rightFrontBottom = points.leftFrontBottom.flipX()

  /*
   * Add the overlap at the button side (noFly side)
   */
  points.rightEdgeTop = points.rightFrontTop.shift(0, absoluteOptions.flyWidth)
  points.rightEdgeBottom = new Point(points.rightEdgeTop.x, points.cbBottom.y)

  /*
   * Fold in the middle
   */
  points.midLeft = new Point(points.leftFrontTop.x, points.cbBottom.y / 2)
  points.midRight = new Point(points.rightEdgeTop.x, points.midLeft.y)

  /*
   * Location of the buttonhole (taking invertFly option into account)
   */
  points.buttonhole = points.leftFrontBottom
    .shiftFractionTowards(points.leftFrontTop, options.invertFly ? 0.75 : 0.25)
    .shift(0, absoluteOptions.waistbandWidth / 4)

  /*
   * Location of the button
   */
  points.button = new Point(
    points.rightEdgeTop.x - absoluteOptions.flyWidth / 2,
    points.buttonhole.y
  )

  /*
   * Indicate the location of the belt loops
   */
  points.leftBackLoopTop = points.cbTop.shiftFractionTowards(points.leftSideTop, 0.5)
  points.leftSideLoopTop = points.leftSideTop.shiftFractionTowards(points.leftFrontTop, 0.06)
  points.leftFrontLoopTop = points.leftSideTop.shiftFractionTowards(points.leftFrontTop, 0.53)
  for (const key of ['Back', 'Side', 'Front']) {
    points[`left${key}LoopBottom`] = new Point(points[`left${key}LoopTop`].x, points.cbBottom.y)
    points[`right${key}LoopTop`] = points[`left${key}LoopTop`].flipX()
    points[`right${key}LoopBottom`] = new Point(points[`right${key}LoopTop`].x, points.cbBottom.y)
    /*
     * Also add points on the left and right edge of the belt loop
     * so we can draw the path later
     */
    for (const side of ['left', 'right']) {
      points[`${side}${key}LoopTopLeft`] = points[`${side}${key}LoopTop`].shift(
        180,
        absoluteOptions.beltLoopWidth / 2
      )
      points[`${side}${key}LoopTopRight`] = points[`${side}${key}LoopTop`].shift(
        0,
        absoluteOptions.beltLoopWidth / 2
      )
      points[`${side}${key}LoopBottomLeft`] = points[`${side}${key}LoopBottom`].shift(
        180,
        absoluteOptions.beltLoopWidth / 2
      )
      points[`${side}${key}LoopBottomRight`] = points[`${side}${key}LoopBottom`].shift(
        0,
        absoluteOptions.beltLoopWidth / 2
      )
    }
  }

  /*
   * Center back belt loop is different (a large wide one)
   */
  points.cbLoopTopLeft = points.cbTop.shiftFractionTowards(points.leftBackLoopTop, 0.5)
  points.cbLoopTopRight = points.cbLoopTopLeft.flipX()
  points.cbLoopBottomLeft = new Point(points.cbLoopTopLeft.x, points.cbBottom.y)
  points.cbLoopBottomRight = points.cbLoopBottomLeft.flipX()

  /*
   * We want to add an attachment here that can hold a mobile phone
   * However, we want to refrain from puttin it over any belt loops so let's
   * see how wide it can be (max) and store that for re-use later when drafting
   * the back attachment
   */
  store.set('backAttachmentMaxWidth', points.leftSideLoopTopRight.dx(points.leftBackLoopTopLeft))

  /*
   * Seamline
   */
  paths.seam = new Path()
    .move(points.leftFrontTop)
    .line(points.leftFrontBottom)
    .line(points.rightEdgeBottom)
    .line(points.rightEdgeTop)
    .line(points.leftFrontTop)
    .close()
    .addClass('fabric')

  /*
   * Only add SA when requested
   */
  if (sa) paths.sa = paths.seam.offset(sa).attr('class', 'fabric sa')

  /*
   * If the user wants a complete pattern, let's add some more guidance
   */
  if (complete) {
    /*
     * Add the fold line
     */
    paths.fold = new Path().move(points.midLeft).line(points.midRight).addClass('help note')

    /*
     * Include a message that this is where to fold the waistband
     */
    macro('banner', {
      path: paths.fold,
      text: 'foldHere',
      className: 'text-sm fill-note',
      repeat: 50,
    })

    /*
     * Indicate the fly edge line
     */
    paths.flyEdge = new Path()
      .move(points.leftFrontBottom)
      .line(points.leftFrontTop)
      .addClass('note dashed')
      .addText('flyEdge', 'text-sm fill-note center')

    /*
     * Indicate location of the belt loops
     */
    for (const key of ['Back', 'Side', 'Front']) {
      for (const side of ['left', 'right']) {
        paths[`beltLoop${capitalize(side)}${key}`] = new Path()
          .move(points[`${side}${key}LoopTopLeft`])
          .line(points[`${side}${key}LoopBottomLeft`])
          .move(points[`${side}${key}LoopBottomRight`])
          .line(points[`${side}${key}LoopTopRight`])
          .addClass('note stroke-sm dashed')
      }
    }
  }

  /*
   * Annotations
   */

  // Cutlist
  store.cutlist.setCut({ cut: 1, from: 'fabric' })

  /*
   * Add the logo
   */
  points.logo = points.midLeft.shiftFractionTowards(points.midRight, 0.65)
  snippets.logo = new Snippet('logo', points.logo).scale(0.666)

  /*
   * Add the title
   */
  points.title = points.logo.shift(0, 70)
  macro('title', {
    at: points.title,
    nr: 7,
    title: 'waistband',
    align: 'center',
    scale: 0.666,
  })

  /*
   * Add the button hole
   */
  snippets.buttonhole = new Snippet('buttonhole-start', points.buttonhole)
    .attr('data-scale', absoluteOptions.waistbandWidth / 16)
    .attr('data-rotate', 90)

  /*
   * Add the button
   */
  snippets.button = new Snippet('button', points.button).attr(
    'data-scale',
    absoluteOptions.waistbandWidth / 16
  )

  /*
   * Add notches to indicate the location of the seams
   */
  macro('sprinkle', {
    snippet: 'notch',
    on: [
      'leftSideTop',
      'rightSideTop',
      'leftFrontTop',
      'cbTop',
      'leftSideBottom',
      'rightSideBottom',
      'leftFrontBottom',
      'cbBottom',
    ],
  })

  /*
   * Add a grainline indicator
   */
  points.grainlineTop = points.leftFrontTop.shiftFractionTowards(points.leftFrontLoopTop, 0.5)
  points.grainlineBottom = new Point(points.grainlineTop.x, points.cbBottom.y)
  macro('grainline', {
    from: points.grainlineBottom,
    to: points.grainlineTop,
  })

  /*
   * Dimensions
   */
  macro('hd', {
    id: 'frontLeft',
    from: points.leftFrontBottom,
    to: points.leftSideBottom,
    y: points.cbBottom.y + 15 + sa,
  })
  macro('hd', {
    id: 'backLeft',
    from: points.leftSideBottom,
    to: points.cbBottom,
    y: points.cbBottom.y + 15 + sa,
  })
  macro('hd', {
    id: 'backRight',
    from: points.cbBottom,
    to: points.rightSideBottom,
    y: points.cbBottom.y + 15 + sa,
  })
  macro('hd', {
    id: 'frontRight',
    from: points.rightSideBottom,
    to: points.rightFrontBottom,
    y: points.cbBottom.y + 15 + sa,
  })
  macro('hd', {
    id: 'overlapRight',
    from: points.rightFrontBottom,
    to: points.rightEdgeBottom,
    y: points.cbBottom.y + 15 + sa,
  })
  macro('hd', {
    id: 'leftHalf',
    from: points.leftFrontBottom,
    to: points.cbBottom,
    y: points.cbBottom.y + 30 + sa,
  })
  macro('hd', {
    id: 'rightHalf',
    from: points.cbBottom,
    to: points.rightFrontBottom,
    y: points.cbBottom.y + 30 + sa,
  })
  macro('hd', {
    id: 'fullLength',
    from: points.leftFrontBottom,
    to: points.rightEdgeBottom,
    y: points.cbBottom.y + 45 + sa,
  })
  macro('vd', {
    id: 'buttonHeight',
    from: points.rightEdgeBottom,
    to: points.button,
    x: points.rightEdgeBottom.x + 15 + sa,
  })
  macro('vd', {
    id: 'buttonHoleHeight',
    from: points.leftFrontBottom,
    to: points.buttonhole,
    x: points.leftFrontBottom.x - sa - 15,
  })
  macro('vd', {
    id: 'fullWidth',
    from: points.leftFrontBottom,
    to: points.leftFrontTop,
    x: points.leftFrontBottom.x - sa - 30,
    scale: 0.5,
  })
  macro('hd', {
    id: 'belLoopLeftFront',
    from: points.leftFrontTop,
    to: points.leftFrontLoopTop,
    y: points.cbTop.y - 30 - sa,
  })
  macro('hd', {
    id: 'beltLoopLeftSide',
    from: points.leftFrontLoopTop,
    to: points.leftSideLoopTop,
    y: points.cbTop.y - 30 - sa,
  })
  macro('hd', {
    id: 'beltLoopLeftBack',
    from: points.leftSideLoopTop,
    to: points.leftBackLoopTop,
    y: points.cbTop.y - 30 - sa,
  })
  macro('hd', {
    id: 'beltLoopLeftCb',
    from: points.leftBackLoopTop,
    to: points.cbTop,
    y: points.cbTop.y - 30 - sa,
  })
  macro('hd', {
    id: 'beltLoopRightCb',
    from: points.cbTop,
    to: points.rightBackLoopTop,
    y: points.cbTop.y - 30 - sa,
  })
  macro('hd', {
    id: 'beltLoopRightBack',
    from: points.rightBackLoopTop,
    to: points.rightSideLoopTop,
    y: points.cbTop.y - 30 - sa,
  })
  macro('hd', {
    id: 'beltLoopRightSide',
    from: points.rightSideLoopTop,
    to: points.rightFrontLoopTop,
    y: points.cbTop.y - 30 - sa,
  })
  macro('hd', {
    id: 'beltLoopRightFront',
    from: points.rightFrontLoopTop,
    to: points.rightFrontTop,
    y: points.cbTop.y - 30 - sa,
  })

  return part
}
