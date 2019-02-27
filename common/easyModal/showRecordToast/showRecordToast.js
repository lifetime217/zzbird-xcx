// common/component/customModal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

    backdrop: {
      type: Boolean,
      value: true
    },

    animated: {
      type: Boolean,
      value: true
    },

    modalSize: {
      type: String,
      value: "md"
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  ready: function() {
    //获得baseModal节点
    if (!this.selectComponent) {
      throw new Error("小程序sdk暂不支持节点操作selectComponent");
    }
    this.showRecordModal = this.selectComponent('#showRecordModal');
  },

  /**
   * 组件的方法列表
   */
  methods: {

    show: function() {
      this.showRecordModal.showModal();
    },

    hide: function() {
      this.showRecordModal.hideModal();
    },


  }
})