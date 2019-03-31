"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var forEach_1 = require("lodash/forEach");

var getComponent_1 = require("../../layouts/getComponent");

var Cascader =
/** @class */
function () {
  function Cascader() {
    var _this = this; // #! 维护所有组件实例的配置


    this._cascadesMap = {}; // #! 维护所有践实例引用

    this._refs = {};
    /**
     * # 装饰一个组件，并加入级联配置信息
     * @param {String} name -指定实例的名称
     * @param {Object} option - 组件的级联配置
     *
     * + getFieldDecorator函数定义
     * ```
     *  getFieldDecorator = function (name, option) {
     *    // Field当前组件的定义
     *    return function(Field) {
     *      return Hoc组件;
     *    }
     *  }
     *
     * // getFieldDecorator(a, b)(Input)
     * ```
     *
     * + option的示例结构
     * ```
     *  option = {
     *    rely,                 // 级联的来源组件实例名称
     *    event,                // 来源组件监听的事件，该事件触发后，会驱动当前组件的触发动作
     *    getVallueFormEvent,   // 触发动作调用时，会传入来源组件触发事件后带进来的值
     *    trigger,              // 当前组件的触发动作
     *    props                 // 装饰组件的额外props
     *  }
     * ```
     *
     * + this._cascadesMap示例结构
     * ```
     * cascadesMap = {
     *  a: {
     *    onChange: [{name, getValueFromEvent, trigger}, ...],
     *    onClick: []
     *  }
     * }
     * ```
     */

    this.getFieldDecorator = function (name, _a) {
      var rely = _a.rely,
          _b = _a.event,
          event = _b === void 0 ? 'onChange' : _b,
          getValueFromEvent = _a.getValueFromEvent,
          trigger = _a.trigger,
          _c = _a.props,
          props = _c === void 0 ? {} : _c;
      return function (Field) {
        /**
         * + 初始化步骤
         * 1. rely有值表示当前组件和来源组件有级联关系，rely指向来源组件的实例名
         * 2. this._cascadesMap[rely]存入当前级联的配置信息，来源组件的事件作为key，值是数组
         *
         * 示例：
         * A（来源）和B有级联，通过A的onClick；当前装饰C，需要和A有级联，通过onChange；当前装饰C，需要和A有级联，通过onChange；当装饰D，D和A也做级联，而且也是通过onChange。
         *
         * A（来源）和B有级联onClick， A本身有onClick事件，alert(1); B本身onChange值介绍1个参数是不行的，必须要接受2个参数，A传给B的值放在第二个参数，同时这个参数值会存起来。
         */
        if (rely) {
          _this._cascadesMap[rely] = _this._cascadesMap[rely] || {};
          var events = _this._cascadesMap[rely][event] = _this._cascadesMap[rely][event] || [];
          var item = events.find(function (item) {
            return item.name === name;
          }); // 是否有重复的级联配置存在

          if (!item) {
            events.push({
              name: name,
              getValueFromEvent: getValueFromEvent,
              trigger: trigger
            });
          }
        } // 1. 外部变量，统一在函数内部一个地方可以管理到
        // 2. 外部变量很大，存在内部变量来使用，效率更高


        var cascadesMap = _this._cascadesMap;
        var refs = _this._refs;
        /**
        * Hoc所需的getProps方法
        * @param {object} props -外部传入的props
        * @param {object} context -父级挂载的组件
        * @param {func} setState -方法
        */

        var getProps = function getProps(props, context, setState) {
          var newProps = props.getProps ? props.getProps(props, context, setState) : {}; // 拿到ref实例

          newProps.ref = function (inst) {
            // 判断是否是Hoc组件
            if (inst && inst.getRealInstance) {
              refs[name] = inst.getRealInstance();
            } else {
              refs[name] = inst;
            }
          };

          var cascadeEvents = cascadesMap[name];

          if (cascadeEvents) {
            // 遍历级联事件
            forEach_1["default"](cascadeEvents, function (cascades, eventName) {
              var eventCb = newProps[eventName] || props[eventName]; // 拦截事件

              newProps[eventName] = function (e) {
                // 之前的事情触发掉。
                var ret = eventCb && eventCb(e);
                var promise = ret && ret.then ? ret : Promise.resolve(); // 在之前的事件触发完成之后再执行后续的动作

                promise.then(function () {
                  cascades.forEach(function (instObj) {
                    var value = e.target ? e.target.value : e; // 组件的实例

                    var instance = refs[instObj.name];

                    if (instance) {
                      //
                      if (instance._triggerParams === undefined) {
                        // 我们给B组件传入值到第二个参数
                        var method_1 = instance[instObj.trigger];

                        instance[instObj.trigger] = function (v) {
                          return method_1.call(this, v, instance._triggerParams);
                        };
                      } // 约定把值传入给_triggerParams


                      instance._triggerParams = instObj.getValueFromEvent ? instObj.getValueFromEvent(value) : null;
                      instance[instObj.trigger]();
                    }
                  });
                });
                return ret;
              };
            });
          }

          return newProps;
        };
        /**
         * Hoc的通用逻辑：B -> Hoc
         * 1. 新定义组件Hoc，传入的所有的prop存在state
         * 2. render函数把state的值，以props的形式传入到A
         * 3. Hoc组件，可以通过getRealInstance获取B的实例
         */


        var HocField = getComponent_1.getComponent(props, getProps)(Field);

        HocField.prototype.getRealInstance = function () {
          return refs[name];
        }; // 装饰当前组件，会生成一个新的Hoc组件返回。


        return HocField;
      };
    };
  } // # 获取组件实例


  Cascader.prototype.getInstance = function (name) {
    return this._refs[name];
  };

  return Cascader;
}();

exports.Cascader = Cascader;