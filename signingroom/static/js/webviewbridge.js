(function() {

  /**
   * WebViewBridge
   */
  window.WebViewBridge = {

    /**
     * used by javascript for calling native functions
     * @param func {string} native function name
     * @param params {array} parameters passed to native function
     * @param callback {function} callback function, which accepts a string as the parameter
     */
    call: function(func, params, callback) {

      if (callback == null) {

        // no callback
        this._sendMsg(func, params, null);

      } else {

        // register the callback
        var key = this._addCallback(callback);

        // send message to native side
        this._sendMsg(func, params, key);
      }
    },


    /**
     * Native function callback hash
     */
    _registeredFunctions: {},

    /**
     * Add callback to hash and return the key
     * @param callback {function} callback function
     * @return {string} callback key
     */
    _addCallback: function(callback) {
      var hash = this._makeHash();

      var key = "__js_callback_" + hash;

      this.registerFunction(key, callback);

      return key;
    },

    registerFunction: function(key, func) {
      this._registeredFunctions[key] = func;
    },

    unregisterFunction: function(key) {
      var func = this._registeredFunctions[key];
      delete this._registeredFunctions[key];
      return func;
    },

    /**
     * Remove callback from the hash
     * @param key {string} callback key
     */
    _removeCallback: function(key) {
      return this.unregisterFunction(key);
    },


    /**
     * Make hash key for _nativeCallbackHash
     * @return {string} a random key
     */
    _makeHash: function() {
      return Math.random().toString(36).substring(2, 10);
    },

    /**
     * Send message to native side.
     * @param func {string} native function name
     * @param parmas {object} params passed to native function
     * @param key {string} callback key
     */
    _sendMsg: function(func, params, key) {

      var msg = this._makeMsg(func, params, key);

      if (window._webviewBridgeNative != null) {
        window._webviewBridgeNative.invokeNativeCall(msg);
      };

    },


    _makeMsg: function(func, params, key) {
      
      var msg = JSON.stringify({
        'func': func,
        'params': params,
        'callback': key
      });

      return msg;
    },


    //======================================================================

    /**
     * Called from native side (native --> javascript)
     */
    _native_call: function(msg) {

      var func = this._registeredFunctions[msg.func];
      if (func) {
        var ret = func(msg.params);
        if (msg.callback) this.call(msg.callback, ret);
        return JSON.stringify(ret);
      }

    },

  };

  // tell native that bridge has been loaded
  var readyEvent = document.createEvent('HTMLEvents');
  readyEvent.initEvent('WebViewBridgeReady');
  readyEvent.bridge = WebViewBridge;
  document.dispatchEvent(readyEvent);

})();
