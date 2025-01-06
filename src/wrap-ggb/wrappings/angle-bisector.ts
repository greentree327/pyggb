import { AppApi } from "../../shared/appApi";
import {
  augmentedGgbApi,
  withPropertiesFromNameValuePairs,
  WrapExistingCtorSpec,
  SkGgbObject,
  setGgbLabelFromArgs,
} from "../shared";
import { SkulptApi } from "../../shared/vendor-types/skulptapi";

import { registerObjectType } from "../type-registry";

declare var Sk: SkulptApi;

interface SkGgbAngleBisector extends SkGgbObject {
//   segment1?: SkGgbObject;
//   segment2?: SkGgbObject;
  point1?: SkGgbObject;
  point2?: SkGgbObject;
  point3?: SkGgbObject;
}

type SkGgbAngleBisectorCtorSpec =
  | WrapExistingCtorSpec
  | {
      kind: "three-points";
      point1: SkGgbObject;
      point2: SkGgbObject;
      point3: SkGgbObject;
    };

export const register = (mod: any, appApi: AppApi) => {
  const ggb = augmentedGgbApi(appApi.ggb);

  const cls = Sk.abstr.buildNativeClass("AngleBisector", {
    constructor: function AngleBisector(
      this: SkGgbAngleBisector,
      spec: SkGgbAngleBisectorCtorSpec
    ) {
      const setLabelArgs = setGgbLabelFromArgs(ggb, this, "AngleBisector");

      switch (spec.kind) {
        case "wrap-existing": {
          this.$ggbLabel = spec.label;
          // TODO: Can we reliably parse ggbApi.getDefinitionString() output to
          // recover the two points?  Do we need to keep a registry of which GGB
          // objects we have already wrapped for Python use?
          //
          // Can get from GGB with Point(SEGMENT, 0) and Point(SEGMENT, 1).
          break;
        }
        case "three-points": {
          setLabelArgs([spec.point1.$ggbLabel, spec.point2.$ggbLabel, spec.point3.$ggbLabel]);
          this.point1 = spec.point1;
          this.point2 = spec.point2;
          this.point3 = spec.point3;
          break;
        }
        default:
          throw new Sk.builtin.TypeError(
            `bad AngleBisector spec kind "${(spec as any).kind}"`
          );
      }
    },
    slots: {
      tp$new(args, kwargs) {
        const badArgsError = new Sk.builtin.TypeError(
          "AngleBisector() arguments must be (point, point, point)"
        );

        const make = (spec: SkGgbAngleBisectorCtorSpec) =>
          withPropertiesFromNameValuePairs(new mod.AngleBisector(spec), kwargs);

        switch (args.length) {
          case 2: {
            if (ggb.everyElementIsGgbObjectOfType(args, "point")) {
              return make({
                kind: "three-points",
                point1: args[0],
                point2: args[1],
                point3: args[2]
              });
            }

            throw badArgsError;
          }
          default:
            throw badArgsError;
        }
      },
    },
    methods: {
      ...ggb.freeCopyMethodsSlice,
    },
    getsets: {
      // "length" is reserved word for Skulpt, so the property must be
      // set up with this mangled name:
      length_$rw$: {
        $get(this: SkGgbAngleBisector) {
          return new Sk.builtin.float_(ggb.getValue(this.$ggbLabel));
        },
      },
      is_visible: ggb.sharedGetSets.is_visible,
      color: ggb.sharedGetSets.color,
      color_floats: ggb.sharedGetSets.color_floats,
      line_thickness: ggb.sharedGetSets.line_thickness,
      _ggb_type: ggb.sharedGetSets._ggb_type,
    },
  });

  mod.AngleBisector = cls;
  registerObjectType("anglebisector", cls);
};
