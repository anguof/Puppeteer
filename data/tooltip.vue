<template>
  <div>
    <div
      ref="reference"
      :class="addTooltipClass()"
      :aria-describedby="tooltipId" 
      :tabindex="tabindex"
    >
      <slot></slot>
    </div>

    <transition
      name="el-fade-in-linear"
      @after-leave="doDestroy"
    >
      <div
        v-show="!disabled && showPopper"
        :id="tooltipId"
        :aria-hidden="showPopper ? 'false' : 'true'"
        ref="popper"
        :class="['el-tooltip__popper', 'is-' + effect, popperClass]"
        @mouseenter="setExpectedState(true)"
        @mouseleave="setExpectedState(false); debounceClose()"
        role="tooltip"
      >
        <slot name="content">{{content}}</slot>
      </div>
    </transition>
  </div>
</template>

<script>
import { on, off } from 'element-ui/src/utils/dom';
import { generateId } from 'element-ui/src/utils/util';
import Popper from 'element-ui/src/utils/vue-popper';
import debounce from 'throttle-debounce/debounce';

export default {
  name: 'ElTooltip',
  mixins: [Popper],
  props: {
    openDelay: {
      type: Number,
      default: 0
    },
    disabled: Boolean,
    manual: Boolean,
    effect: {
      type: String,
      default: 'dark'
    },
    popperClass: String,
    content: String,
    transition: {
      type: String,
      default: 'el-fade-in-linear'
    },
    tabindex: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      tooltipId: generateId(),
      timeoutPending: null,
      focusing: false
    };
  },

  beforeCreate() {
    if (this.$isServer) return;
    this.debounceClose = debounce(200, () => this.handleClosePopper());
  },

  methods: {
    show() {
      this.setExpectedState(true);
      this.handleShowPopper();
    },

    hide() {
      // this.setExpectedState(false);
      // this.debounceClose();
    },
    handleFocus() {
      this.focusing = true;
      this.show();
    },
    handleBlur() {
      this.focusing = false;
      this.hide();
    },
    removeFocusing() {
      this.focusing = false;
    },

    addTooltipClass(prev) {
      if (!prev) {
        return 'el-tooltip';
      } else {
        return 'el-tooltip ' + prev.replace('el-tooltip', '');
      }
    },

    handleShowPopper() {
      if (!this.expectedState || this.manual) return;
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.showPopper = true;
      }, this.openDelay);

      if (this.hideAfter > 0) {
        this.timeoutPending = setTimeout(() => {
          this.showPopper = false;
        }, this.hideAfter);
      }
    },

    handleClosePopper() {
      if (this.enterable && this.expectedState || this.manual) return;
      clearTimeout(this.timeout);

      if (this.timeoutPending) {
        clearTimeout(this.timeoutPending);
      }
      this.showPopper = false;

      if (this.disabled) {
        this.doDestroy();
      }
    },

    setExpectedState(expectedState) {
      if (expectedState === false) {
        clearTimeout(this.timeoutPending);
      }
      this.expectedState = expectedState;
    },

    getFirstElement() {
    }
  },

  mounted() {
    this.referenceElm = this.$slots.default[0].elm;
    console.log(this.referenceElm);
    if (this.$el.nodeType === 1) {
      this.$el.setAttribute('aria-describedby', this.tooltipId);
      this.$el.setAttribute('tabindex', this.tabindex);
      on(this.referenceElm, 'mouseenter', this.show);
      on(this.referenceElm, 'mouseleave', this.hide);
      on(this.referenceElm, 'focus', () => {
        if (!this.$slots.default || !this.$slots.default.length) {
          this.handleFocus();
          return;
        }
        const instance = this.$slots.default[0].componentInstance;
        if (instance && instance.focus) {
          instance.focus();
        } else {
          this.handleFocus();
        }
      });
      on(this.referenceElm, 'blur', this.handleBlur);
      on(this.referenceElm, 'click', this.removeFocusing);
    }
  },

  destroyed() {
    const reference = this.referenceElm;
    if (reference.nodeType === 1) {
      off(reference, 'mouseenter', this.show);
      off(reference, 'mouseleave', this.hide);
      off(reference, 'focus', this.handleFocus);
      off(reference, 'blur', this.handleBlur);
      off(reference, 'click', this.removeFocusing);
    }
  }

};
</script>