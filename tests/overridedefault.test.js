import Resolver from "../src/index";
import { isString } from "@kubric/utils";
import sanitizeHTML from "sanitize-html";

const resolver = new Resolver({
  overrideDefault: true
});

const sanitizeJSON = dirtyJSON =>
  resolver.resolve(dirtyJSON, {}, {
    mappers: [
      [/(.*)/g, (match, formula) => {
        if (isString(match)) {
          return sanitizeHTML(match);
        } else {
          return match;
        }
      }]
    ]
  });

const template = {
  templates: {
    "duration": 1000,
    "size": {
      "h": "{{canvas-size-h}}",
      "w": "{{canvas-size-w}}"
    },
    "objects": [
      {
        "comment": "canvas backdrop shape1",
        "type": "shape",
        "kind": "rectangle",
        "opacity": "[[{{canvas_backdrop_shape1_opacity}}]]",
        "color": "{{canvas_backdrop_shape1_color}}",
        "scale": {
          "reference": "{{canvas_backdrop_shape1_alignment}}",
          "value": 1
        },
        "position": {
          "y": "[[{{canvas-size-h}}/2 + {{canvas_backdrop_shape1_pos.y}}]]",
          "x": "[[{{canvas-size-w}}/2 + {{canvas_backdrop_shape1_pos.x}}]]"
        },
        "size": {
          "h": "[[{{canvas_backdrop_shape1_height}}]]",
          "w": "[[{{canvas_backdrop_shape1_width}}]]"
        },
        "stroke": {
          "color": "{{canvas_backdrop_shape1_strokecolor}}",
          "width": "[[{{canvas_backdrop_shape1_strokewidth}}]]"
        },
        "borderRadius": "[[{{canvas_backdrop_shape1_borderradius}}]]",
        "uid": "7f208a3d-1a4e-4d3e-9785-a210d389121d"
      },
      {
        "comment": "hero image1 with bg",
        "type": "image",
        "opacity": "[[{{hero_image1_with_bg_opacity}}]]",
        "url": "{{hero_image1_with_bg_url}}",
        "scale": {
          "reference": "{{hero_image1_with_bg_alignment}}",
          "value": 1
        },
        "contain": true,
        "position": {
          "y": "[[{{canvas-size-h}}/2 + {{hero_image1_with_bg_pos.y}}]]",
          "x": "[[{{canvas-size-w}}/2 + {{hero_image1_with_bg_pos.x}}]]"
        },
        "size": {
          "h": "[[{{hero_image1_with_bg_size}}]]",
          "w": "[[{{hero_image1_with_bg_size}}]]"
        },
        "mask": {
          "position": {
            "y": "[[{{hero_image1_with_bg_maskpos.y}}]]",
            "x": "[[{{hero_image1_with_bg_maskpos.x}}]]"
          },
          "shape": "rectangle",
          "size": {
            "h": "[[{{hero_image1_with_bg_maskheight}}]]",
            "w": "[[{{hero_image1_with_bg_maskwidth}}]]"
          },
          "borderRadius": [
            "[[{{hero_image1_with_bg_maskborderradius}}]]",
            "[[{{hero_image1_with_bg_maskborderradius}}]]",
            0,
            0
          ],
          "stroke": {
            "color": "{{hero_image1_with_bg_maskstrokecolor}}",
            "width": "[[{{hero_image1_with_bg_maskstrokewidth}}]]"
          }
        },
        "shadow": [
          "{{hero_image1_with_bg_shadowcolor}}{{hero_image1_with_bg_shadowopacity}}",
          "[[{{hero_image1_with_bg_shadowspread}}]]",
          "[[{{hero_image1_with_bg_shadowpos.x}}]]",
          "[[{{hero_image1_with_bg_shadowpos.y}}]]"
        ],
        "rotate": {
          "rotateBy": "{{hero_image1_with_bg_rotate}}"
        },
        "uid": "84714f18-0202-4a37-b101-ada2bfbdba63"
      },
      {
        "comment": "canvas backdrop image1",
        "type": "image",
        "opacity": "[[{{canvas_backdrop_image1_opacity}}]]",
        "url": "{{canvas_backdrop_image1_url}}",
        "scale": {
          "reference": "{{canvas_backdrop_image1_alignment}}",
          "value": 1
        },
        "contain": true,
        "position": {
          "y": "[[{{canvas-size-h}}/2 + {{canvas_backdrop_image1_pos.y}}]]",
          "x": "[[{{canvas-size-w}}/2 + {{canvas_backdrop_image1_pos.x}}]]"
        },
        "size": {
          "h": "[[{{canvas_backdrop_image1_size}}]]",
          "w": "[[{{canvas_backdrop_image1_size}}]]"
        },
        "uid": "34464874-6bcc-4458-ba8d-96967df6aa99"
      },
      {
        "comment": "hero image1 wihout bg",
        "type": "image",
        "opacity": "[[{{hero_image1_wihout_bg_opacity}}]]",
        "url": "{{hero_image1_wihout_bg_url}}",
        "scale": {
          "reference": "{{hero_image1_wihout_bg_alignment}}",
          "value": 1
        },
        "contain": true,
        "position": {
          "y": "[[{{canvas-size-h}}/2 + {{hero_image1_wihout_bg_pos.y}}]]",
          "x": "[[{{canvas-size-w}}/2 + {{hero_image1_wihout_bg_pos.x}}]]"
        },
        "size": {
          "h": "[[{{hero_image1_wihout_bg_size}}]]",
          "w": "[[{{hero_image1_wihout_bg_size}}]]"
        },
        "mask": {
          "position": {
            "y": "[[{{hero_image1_with_bg_maskpos.y}}]]",
            "x": "[[{{hero_image1_with_bg_maskpos.x}}]]"
          },
          "shape": "rectangle",
          "size": {
            "h": "[[{{hero_image1_with_bg_maskheight}}]]",
            "w": "[[{{hero_image1_with_bg_maskwidth}}]]"
          },
          "borderRadius": [
            "[[{{hero_image1_with_bg_maskborderradius}}]]",
            "[[{{hero_image1_with_bg_maskborderradius}}]]",
            0,
            0
          ],
          "stroke": {
            "color": "{{hero_image1_with_bg_maskstrokecolor}}",
            "width": "[[{{hero_image1_with_bg_maskstrokewidth}}]]"
          }
        },
        "shadow": [
          "{{hero_image1_wihout_bg_shadowcolor}}{{hero_image1_wihout_bg_shadowopacity}}",
          "[[{{hero_image1_wihout_bg_shadowspread}}*{{hero_image1_wihout_bg_shadow_opacity}}]]",
          "[[{{hero_image1_wihout_bg_shadowpos.x}}*{{hero_image1_wihout_bg_shadow_opacity}}]]",
          "[[{{hero_image1_wihout_bg_shadowpos.y}}*{{hero_image1_wihout_bg_shadow_opacity}}]]"
        ],
        "rotate": {
          "rotateBy": "{{hero_image1_wihout_bg_rotate}}"
        },
        "uid": "a55b3ba8-fb41-4618-b4ac-c9b16bc9fa1f"
      },
      {
        "comment": "offer price",
        "type": "text",
        "opacity": "[[{{offer_price_opacity}}]]",
        "text": "{{offer_price_text}}",
        "fontFamily": {
          "url": "{{offer_price_fonturl}}",
          "name": "{{offer_price_fontname}}"
        },
        "color": "{{offer_price_color}}",
        "letterSpacing": "{{offer_price_letterspacing}}",
        "lineSpacing": "{{offer_price_linespacing}}",
        "align": "{{offer_price_alignment}}",
        "position": {
          "y": "[[{{offer_price_pos.y}}]]",
          "x": "[[{{offer_price_pos.x}}]]",
          "baseline": true
        },
        "fontSize": "[[{{offer_price_size}}]]",
        "shadow": [
          "{{offer_price_shadowcolor}}{{offer_price_shadowopacity}}",
          "[[{{offer_price_shadowspread}}]]",
          "[[{{offer_price_shadowpos.x}}]]",
          "[[{{offer_price_shadowpos.y}}]]"
        ],
        "uid": "1b69433a-82a5-4138-b7ac-ce90293b8e3b"
      },
      {
        "comment": "original price",
        "type": "text",
        "opacity": "[[{{original_price_opacity}}]]",
        "text": "{{original_price_text}}",
        "fontFamily": {
          "url": "{{original_price_fonturl}}",
          "name": "{{original_price_fontname}}"
        },
        "color": "{{original_price_color}}",
        "letterSpacing": "{{original_price_letterspacing}}",
        "lineSpacing": "{{original_price_linespacing}}",
        "align": "{{original_price_alignment}}",
        "position": {
          "y": "[[{{original_price_pos.y}}]]",
          "x": "[[{{original_price_pos.x}}]]",
          "baseline": true
        },
        "fontSize": "[[{{original_price_size}}]]",
        "shadow": [
          "{{original_price_shadowcolor}}{{original_price_shadowopacity}}",
          "[[{{original_price_shadowspread}}]]",
          "[[{{original_price_shadowpos.x}}]]",
          "[[{{original_price_shadowpos.y}}]]"
        ],
        "uid": "decb590a-e795-4b93-bae7-d3b14a8b86a7"
      },
      {
        "comment": "strikeoff",
        "type": "shape",
        "kind": "rectangle",
        "opacity": "[[{{original_price_opacity}}]]",
        "color": "{{original_price_color}}",
        "scale": {
          "reference": "{{strikeoff_alignment}}",
          "value": 1
        },
        "position": {
          "y": "[[{{canvas-size-h}}/2 + {{strikeoff_pos.y}}]]",
          "x": "[[{{canvas-size-w}}/2 + {{strikeoff_pos.x}}]]"
        },
        "size": {
          "h": "[[{{strikeoff_height}}]]",
          "w": "[[{{strikeoff_width}}]]"
        },
        "uid": "3922ae22-85a4-44ab-87a6-a6b744fe841f"
      },
      {
        "comment": "copy line1",
        "type": "text",
        "opacity": "[[{{copy_line1_opacity}}]]",
        "text": "{{copy_line1_text}}",
        "fontFamily": {
          "url": "{{copy_line1_fonturl}}",
          "name": "{{copy_line1_fontname}}"
        },
        "color": "{{copy_line1_color}}",
        "letterSpacing": "{{copy_line1_letterspacing}}",
        "lineSpacing": "{{copy_line1_linespacing}}",
        "align": "{{copy_line1_alignment}}",
        "position": {
          "y": "[[{{copy_line1_pos.y}}]]",
          "x": "[[{{copy_line1_pos.x}}]]",
          "baseline": true
        },
        "fontSize": "[[{{copy_line1_size}}]]",
        "shadow": [
          "{{copy_line1_shadowcolor}}{{copy_line1_shadowopacity}}",
          "[[{{copy_line1_shadowspread}}]]",
          "[[{{copy_line1_shadowpos.x}}]]",
          "[[{{copy_line1_shadowpos.y}}]]"
        ],
        "uid": "a99d904f-3b14-48a8-93a7-dcdf59cf9439"
      },
      {
        "comment": "tnc",
        "type": "text",
        "opacity": "[[{{tnc_opacity}}]]",
        "text": "{{tnc_text}}",
        "fontFamily": {
          "url": "{{tnc_fonturl}}",
          "name": "{{tnc_fontname}}"
        },
        "color": "{{tnc_color}}",
        "letterSpacing": "{{tnc_letterspacing}}",
        "lineSpacing": "{{tnc_linespacing}}",
        "align": "{{tnc_alignment}}",
        "position": {
          "y": "[[{{tnc_pos.y}}]]",
          "x": "[[{{tnc_pos.x}}]]",
          "baseline": true
        },
        "fontSize": "[[{{tnc_size}}]]",
        "shadow": [
          "{{tnc_shadowcolor}}{{tnc_shadowopacity}}",
          "[[{{tnc_shadowspread}}]]",
          "[[{{tnc_shadowpos.x}}]]",
          "[[{{tnc_shadowpos.y}}]]"
        ],
        "uid": "f8f4fea4-957e-464b-8a7b-a9b0f1edd2de"
      },
      {
        "comment": "ref",
        "type": "image",
        "opacity": 0,
        "url": "https://media.kubric.io/api/assetlib/09479472-77c1-40a7-a859-cb2743b953b2.png",
        "scale": {
          "reference": "{{canvas_backdrop_image1_alignment}}",
          "value": 1
        },
        "contain": true,
        "position": {
          "y": "[[{{canvas-size-h}}/2 + {{canvas_backdrop_image1_pos.y}}]]",
          "x": "[[{{canvas-size-w}}/2 + {{canvas_backdrop_image1_pos.x}}]]"
        },
        "size": {
          "h": "[[{{canvas_backdrop_image1_size}}]]",
          "w": "[[{{canvas_backdrop_image1_size}}]]"
        },
        "uid": "34464874-6bcc-4458-ba8d-96967df6aa99"
      }
    ]
  },
  parameters: {
    "canvas-size-h": 660,
    "canvas-size-w": 440,
    "canvas_backdrop_image1_alignment": "center",
    "canvas_backdrop_image1_opacity": 1,
    "canvas_backdrop_image1_pos": {
      "x": 0,
      "y": 0
    },
    "canvas_backdrop_image1_size": 660,
    "canvas_backdrop_image1_url": "https://media.kubric.io/api/assetlib/8a95ad21-2fee-441a-ab60-e9444932df93.jpg",
    "canvas_backdrop_shape1_alignment": "center",
    "canvas_backdrop_shape1_borderradius": 30,
    "canvas_backdrop_shape1_color": "#FFFFFF",
    "canvas_backdrop_shape1_height": 1000,
    "canvas_backdrop_shape1_opacity": 1,
    "canvas_backdrop_shape1_pos": {
      "x": 0,
      "y": -111
    },
    "canvas_backdrop_shape1_strokecolor": "#00FFFF00",
    "canvas_backdrop_shape1_strokewidth": 5,
    "canvas_backdrop_shape1_width": 1000,
    "copy_line1_alignment": "center",
    "copy_line1_color": "#FFFFFF",
    "copy_line1_fontname": "Akrobat-semibold",
    "copy_line1_fonturl": "https://media.kubric.io/api/assetlib/a5f509bb-1ce6-4959-8c1c-927a93b24f8b.ttf",
    "copy_line1_letterspacing": 1.2,
    "copy_line1_linespacing": "0",
    "copy_line1_opacity": 1,
    "copy_line1_pos": {
      "x": 220,
      "y": 505
    },
    "copy_line1_shadowcolor": "#000000",
    "copy_line1_shadowopacity": "00",
    "copy_line1_shadowpos": {
      "x": 10,
      "y": 10
    },
    "copy_line1_shadowspread": 10,
    "copy_line1_size": 51,
    "copy_line1_text": "Kurta +\\n Sarees",
    "hero_image1_wihout_bg_alignment": "center",
    "hero_image1_wihout_bg_maskborderradius": 100,
    "hero_image1_wihout_bg_maskheight": 1000,
    "hero_image1_wihout_bg_maskpos": {
      "x": 0,
      "y": 0
    },
    "hero_image1_wihout_bg_maskstrokecolor": "#00FF0000",
    "hero_image1_wihout_bg_maskstrokewidth": 4,
    "hero_image1_wihout_bg_maskwidth": 1000,
    "hero_image1_wihout_bg_opacity": 1,
    "hero_image1_wihout_bg_pos": {
      "x": 0,
      "y": -80
    },
    "hero_image1_wihout_bg_rotate": 0,
    "hero_image1_wihout_bg_search": "Image Search Folder",
    "hero_image1_wihout_bg_shadow_opacity": 0,
    "hero_image1_wihout_bg_shadowcolor": "#000000",
    "hero_image1_wihout_bg_shadowopacity": "4F",
    "hero_image1_wihout_bg_shadowpos": {
      "x": 10,
      "y": 10
    },
    "hero_image1_wihout_bg_shadowspread": 10,
    "hero_image1_wihout_bg_size": 360,
    "hero_image1_wihout_bg_tag": "Blank, Empty",
    "hero_image1_wihout_bg_url": "https://storage.googleapis.com/auto-suggest/zwY54027pxLPVt5tccYsUg\u003d\u003d",
    "hero_image1_with_bg_alignment": "center",
    "hero_image1_with_bg_maskborderradius": 12,
    "hero_image1_with_bg_maskheight": 365,
    "hero_image1_with_bg_maskpos": {
      "x": 42,
      "y": 45
    },
    "hero_image1_with_bg_maskstrokecolor": "#FFFFFF",
    "hero_image1_with_bg_maskstrokewidth": 4,
    "hero_image1_with_bg_maskwidth": 355,
    "hero_image1_with_bg_opacity": 0,
    "hero_image1_with_bg_pos": {
      "x": 0,
      "y": -125
    },
    "hero_image1_with_bg_rotate": 0,
    "hero_image1_with_bg_search": "1eb0580e-8388-4c0b-bdc9-ad75a346d9a7",
    "hero_image1_with_bg_shadowcolor": "#000000",
    "hero_image1_with_bg_shadowopacity": "00",
    "hero_image1_with_bg_shadowpos": {
      "x": 10,
      "y": 10
    },
    "hero_image1_with_bg_shadowspread": 10,
    "hero_image1_with_bg_size": 100,
    "hero_image1_with_bg_tag": "Blank, Empty",
    "hero_image1_with_bg_url": "https://media.kubric.io/api/assetlib/a1259f3d-d0ed-4cbe-8784-be4b0ef11a37.png",
    "offer_price_alignment": "center",
    "offer_price_color": "#fed530",
    "offer_price_fontname": "Akrobat-bold",
    "offer_price_fonturl": "https://media.kubric.io/api/assetlib/7d9136a5-98de-4019-a48c-6137a22b8a60.ttf",
    "offer_price_letterspacing": 7,
    "offer_price_linespacing": "0",
    "offer_price_opacity": 1,
    "offer_price_pos": {
      "x": 220,
      "y": 625
    },
    "offer_price_shadowcolor": "#000000",
    "offer_price_shadowopacity": "00",
    "offer_price_shadowpos": {
      "x": 10,
      "y": 10
    },
    "offer_price_shadowspread": 10,
    "offer_price_size": 56,
    "offer_price_text": "COMBO",
    "original_price_alignment": "right",
    "original_price_color": "#979797",
    "original_price_fontname": "Roboto-Medium",
    "original_price_fonturl": "https://storage.googleapis.com/assetlib/c7da470c-70ca-4e0d-9c4b-ba149e00083b.ttf",
    "original_price_letterspacing": "0",
    "original_price_linespacing": "0",
    "original_price_opacity": 0,
    "original_price_pos": {
      "x": 670,
      "y": 650
    },
    "original_price_shadowcolor": "#000000",
    "original_price_shadowopacity": "00",
    "original_price_shadowpos": {
      "x": 10,
      "y": 10
    },
    "original_price_shadowspread": 10,
    "original_price_size": 45,
    "original_price_text": "₹899",
    "strikeoff_alignment": "right",
    "strikeoff_color": "#979797",
    "strikeoff_height": 4,
    "strikeoff_opacity": 1,
    "strikeoff_pos": {
      "x": 207,
      "y": 275
    },
    "strikeoff_rotate": 0,
    "strikeoff_width": 105,
    "tnc_alignment": "right",
    "tnc_color": "#303030",
    "tnc_fontname": "Roboto-Regular",
    "tnc_fonturl": "https://storage.googleapis.com/assetlib/961e1675-174d-40b2-a7a2-3d880bad3aa8.ttf",
    "tnc_letterspacing": "0",
    "tnc_linespacing": "0",
    "tnc_opacity": 1,
    "tnc_pos": {
      "x": 680,
      "y": 680
    },
    "tnc_shadowcolor": "#000000",
    "tnc_shadowopacity": "00",
    "tnc_shadowpos": {
      "x": 10,
      "y": 10
    },
    "tnc_shadowspread": 10,
    "tnc_size": 20,
    "tnc_text": ""
  }
};

describe("sanitizeJSON tests", () => {
  it("should sanitize", () => expect(sanitizeJSON(template)).toEqual(template));
});

const template1 = {
  "id": "cards",
  "name": "Card",
  "styles": {
    "display": "flex",
    "flexDirection": "column"
  },
  "content": [
    {
      "id": "image",
      "name": "Hero image",
      "styles": {
        "backgroundImage": "{{image.backgroundImage}}",
        "height": 200,
        "width": 200,
        "backgroundSize": "cover",
        "backgroundPosition": "center center"
      }
    },
    {
      "id": "details",
      "name": "Image Details",
      "styles": {
        "padding": 12
      },
      "content": [
        {
          "id": "tag",
          "name": "Tag text",
          "styles": {
            "background": "{{tag.background}}",
            "fontSize": "{{tag.fontSize}}",
            "color": "{{tag.color}}",
            "padding": 5,
            "borderRadius": 8,
            "marginBottom": 10
          },
          "content": "{{tag.text}}"
        },
        {
          "id": "heading",
          "name": "Heading",
          "styles": {
            "color": "{{heading.color}}",
            "fontSize": "{{heading.fontSize}}",
            "marginBottom": 10
          },
          "content": "{{heading.text}}"
        },
        {
          "id": "subheading",
          "name": "Subheading",
          "styles": {
            "color": "{{subheading.color}}",
            "fontSize": "{{subheading.fontSize}}"
          },
          "content": "{{subheading.text}}"
        }
      ]
    }
  ]
}

describe("overrideDefault issue", () => expect(resolver.resolve(template1, {},
  {
    mappers: [
      [
        /{{(.+?)}}/g,
        (_, group) =>
          `{{test.0.${group}}}`,
      ],
    ],
  }
)).toEqual({
  "content": [
    {
      "id": "image",
      "name": "Hero image",
      "styles": {
        "backgroundImage": "{{test.0.image.backgroundImage}}",
        "backgroundPosition": "center center",
        "backgroundSize": "cover",
        "height": 200,
        "width": 200
      }
    },
    {
      "content": [
        {
          "content": "{{test.0.tag.text}}",
          "id": "tag",
          "name": "Tag text",
          "styles": {
            "background": "{{test.0.tag.background}}",
            "borderRadius": 8,
            "color": "{{test.0.tag.color}}",
            "fontSize": "{{test.0.tag.fontSize}}",
            "marginBottom": 10,
            "padding": 5
          }
        },
        {
          "content": "{{test.0.heading.text}}",
          "id": "heading",
          "name": "Heading",
          "styles": {
            "color": "{{test.0.heading.color}}",
            "fontSize": "{{test.0.heading.fontSize}}",
            "marginBottom": 10
          }
        },
        {
          "content": "{{test.0.subheading.text}}",
          "id": "subheading",
          "name": "Subheading",
          "styles": {
            "color": "{{test.0.subheading.color}}",
            "fontSize": "{{test.0.subheading.fontSize}}"
          }
        }
      ],
      "id": "details",
      "name": "Image Details",
      "styles": {
        "padding": 12
      }
    }
  ],
  "id": "cards",
  "name": "Card",
  "styles": {
    "display": "flex",
    "flexDirection": "column"
  }
}));