import freesewing from "freesewing";
import baseCss from "../src/lib/base.css.js";
import notch from "../src/lib/notch";
import gridMetric from "../src/lib/grid-metric";
import gridImperial from "../src/lib/grid-imperial";
import { version } from "../package.json";
import plugin from "../dist/index";

let chai = require("chai");
chai.use(require("chai-string"));
let expect = chai.expect;

it("Should set the plugin name:version attribute", () => {
  let pattern = new freesewing.Pattern().with(plugin);
  pattern.render();
  expect(pattern.svg.attributes.get("freesewing:plugin-theme")).to.equal(
    version
  );
});

it("Should load base CSS", () => {
  let pattern = new freesewing.Pattern().with(plugin);
  pattern.render();
  expect(pattern.svg.style).to.equal(baseCss);
});

it("Should load notch defs", () => {
  let pattern = new freesewing.Pattern().with(plugin);
  pattern.render();
  expect(pattern.svg.defs).to.equal(notch);
});

it("Should load the metric grid for paperless", () => {
  let pattern = new freesewing.Pattern().with(plugin);
  pattern.settings.paperless = true;
  pattern.render();
  expect(pattern.svg.defs).to.equal(notch + gridMetric);
});

it("Should load the imperial grid for paperless", () => {
  let pattern = new freesewing.Pattern().with(plugin);
  pattern.settings.paperless = true;
  pattern.settings.units = "imperial";
  pattern.render();
  expect(pattern.svg.defs).to.equal(notch + gridImperial);
});

it("Should inject a part grid for paperless", () => {
  let pattern = new freesewing.Pattern().with(plugin);
  pattern.settings.paperless = true;
  pattern.parts.test = new pattern.Part();
  pattern.render();
  let box = '<pattern id="grid_test" xlink:href="#grid" x="0" y="0"></pattern>';
  expect(pattern.svg.defs).to.equalIgnoreSpaces(notch + gridMetric + box);
});

it("Should inject an anchored part grid for paperless", () => {
  let pattern = new freesewing.Pattern().with(plugin);
  pattern.settings.paperless = true;
  pattern.parts.test = new pattern.Part();
  pattern.parts.test.points.anchor = new freesewing.Point(23, 45);
  pattern.render();
  let box =
    '<pattern id="grid_test" xlink:href="#grid" x="23" y="45"></pattern>';
  expect(pattern.svg.defs).to.equalIgnoreSpaces(notch + gridMetric + box);
});
