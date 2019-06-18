
import { Sin, Cos, Asin, Deg2Rad, Rad2Deg, PI } from './math'

/**
 * Output a path string of an annulus sector, based on 6 parameters:
 * startAngle, endAngle, outerRadius, innerRadius, centerX, centerY
 *
 * REPLACE WITH D3.ARC() !
 */
type AnnularOptions = {
  startAngle: number,
  endAngle: number,
  offsetAngle: number,
  outerRadius: number,
  innerRadius: number,
  cx: number,
  cy: number
}

export function AnnulusSector(opts: AnnularOptions): string {
  ['startAngle', 'endAngle', 'outerRadius', 'innerRadius', 'cx', 'cy'].forEach(attr => {
    if (opts[attr] == undefined) throw Error('Undefined/Null parameter: ' + attr)
  })
  let { cx, cy, outerRadius, innerRadius, offsetAngle, startAngle, endAngle } = opts
  if ((offsetAngle = Number(offsetAngle))) {
    startAngle += offsetAngle
    endAngle += offsetAngle
  }
  let startRad = Deg2Rad(startAngle)
  let endRad = Deg2Rad(endAngle)
  let points = [
    [cx + outerRadius * Cos(startRad), cy - outerRadius * Sin(startRad)],
    [cx + outerRadius * Cos(endRad), cy - outerRadius * Sin(endRad)],
    [cx + innerRadius * Cos(endRad), cy - innerRadius * Sin(endRad)],
    [cx + innerRadius * Cos(startRad), cy - innerRadius * Sin(startRad)],
  ]

  let angle = endRad - startRad
  let largeArc = (angle % (PI*2)) > PI ? 1 : 0
  let cmds = []
  cmds.push("M" + points[0].join())                                            // Move to P0
  cmds.push("A" +[outerRadius, outerRadius, 1, largeArc, 0, points[1]].join()) // Arc to P1
  cmds.push("L" + points[2].join())                                            // Line to P2
  cmds.push("A" + [innerRadius, innerRadius, 0, largeArc, 1, points[3]].join())// Arc to P3
  cmds.push("z")                                                               // Close path (Line to P0)

  return cmds.join(' ')
}
