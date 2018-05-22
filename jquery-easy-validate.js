/**
 * jQuery Easy Validate
 * https://github.com/kanakogi/jquery.easy.validate
 *
 * Copyright 2018, Masahiro Nakashima - https://www.kigurumi.asia
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */
;
(function($) {
  $.fn.easyValidate = function(opts) {
    var elements = this;
    // 渡されたオプションとデフォルトをマージする
    var options = $.extend({}, $.fn.easyValidate.defaults, opts);
    // オプションを変数に
    var messages = $.extend({}, $.fn.easyValidate.defaults.messages, opts.messages);
    var errorMessagePosition = options.errorMessagePosition;
    var errorMessageTag = options.errorMessageTag;
    var errorMessageClass = options.errorMessageClass.replace('.', "")
    var errorMessageAttr = options.errorMessageAttr;
    var errorAddClassTarget = options.errorAddClassTarget;
    var errorAddClass = options.errorAddClass.replace('.', "");
    var errors = [];

    /* 要素に実行 */
    elements.each(function() {
      // Validate
      validate($(this));

      // Submit時
      $(this).find('form').submit(function() {
        // 強制的にValidate
        var $checkboxes = [];
        $(this).find('*[class^="validation"]').each(function(index, val) {
          $(this).focus().blur();
          // checkbox
          if ($(this).attr('type') == 'checkbox') {
            $checkboxes.push($(this));
          }
          // select
          if ($(this).is('select')) {
            if (!isSelected($(this))) {
              doError('required-select', $(this), index, val, null);
            } else {
              doUnerror('required-select', $(this), index, val);
            }
          }
        });
        // checkbox
        if (!isChecked($checkboxes)) {
          doError('required-checkbox', $checkboxes[0], 0, 0, null);
        } else {
          doUnerror('required-checkbox', $checkboxes[0], 0, 0);
        }

        // エラーがあったらsubmitをキャンセル
        for (var i = 0; i < errors.length; i++) {
          if (errors[i].length > 0) {
            return false;
          }
        }
      });
    });

    /**
     * Validate
     */
    function validate($this) {
      var $container = $this;
      $this.find('*[class^="validation"]').each(function(index, val) {
        // 必須項目
        if ($(this).hasClass('validation-required')) {
          // checkbox
          if ($(this).attr('type') == 'checkbox') {
            $(this).on('change', function() {
              var $checkboxes = $container.find('input[name="' + $(this).attr('name') + '"]');
              if (!isChecked($checkboxes)) {
                doError('required-checkbox', $(this), index, val, null);
              } else {
                doUnerror('required-checkbox', $(this), index, val);
              }
            });
          }
          // select
          else if ($(this).is('select')) {
            $(this).on('change', function() {
              if (!isSelected($(this))) {
                doError('required-select', $(this), index, val, null);
              } else {
                doUnerror('required-select', $(this), index, val);
              }
            });
          }
          // text
          else {
            $(this).on('blur', function() {
              if ($(this).val() == "") {
                doError('required', $(this), index, val, null);
              } else {
                doUnerror('required', $(this), index, val);
              }
            });
          }
        }
        //メールアドレス
        if ($(this).hasClass('validation-email')) {
          $(this).on('blur', function() {
            if (!$(this).val().match(/^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/)) {
              doError('email', $(this), index, val, null);
            } else {
              doUnerror('email', $(this), index, val);
            }
          });
        }
        //入力値が同じかどうか
        if ($(this).prop('className').match(/(?:^| )validation-equalTo-([a-zA-Z0-9_-]*)(?: |$)/)) {
          var target = $(this).prop('className').match(/(?:^| )validation-equalTo-([a-zA-Z0-9_-]*)(?: |$)/);
          var targetName = target[1];
          $(this).on('blur', function() {
            if ($(this).val() != $('*[name=' + targetName + ']').val()) {
              doError('equalTo', $(this), index, val, null);
            } else {
              doUnerror('equalTo', $(this), index, val);
            }
          });
        }
        //電話番号入力チェック
        if ($(this).hasClass('validation-tel')) {
          $(this).on('blur', function() {
            if (!$(this).val().match(/^0\d{1,4}-\d{1,4}-\d{3,4}$/)) {
              doError('tel', $(this), index, val, null);
            } else {
              doUnerror('tel', $(this), index, val);
            }
          });
        }
        // URL
        if ($(this).hasClass('validation-url')) {
          $(this).on('blur', function() {
            if (!$(this).val().match(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/)) {
              doError('url', $(this), index, val, null);
            } else {
              doUnerror('url', $(this), index, val);
            }
          });
        }
        // Number
        if ($(this).hasClass('validation-number')) {
          $(this).on('blur', function() {
            if (!isNumber($(this).val())) {
              doError('number', $(this), index, val, null);
            } else {
              doUnerror('number', $(this), index, val);
            }
          });
        }
        // Max
        if ($(this).prop('className').match(/(?:^| )validation-max([0-9]+)(?: |$)/)) {
          $(this).on('blur', function() {
            var maxObj = $(this).prop('className').match(/(?:^| )validation-max([0-9]+)(?: |$)/);
            var maxNumber = Number(maxObj[1]);
            if ($(this).val() != '') {
              if ($(this).val() > maxNumber) {
                doError('max', $(this), index, val, maxNumber);
              } else {
                doUnerror('max', $(this), index, val);
              }
            }
          });
        }
        // Min
        if ($(this).prop('className').match(/(?:^| )validation-min([0-9]+)(?: |$)/)) {
          $(this).on('blur', function() {
            var minObj = $(this).prop('className').match(/(?:^| )validation-min([0-9]+)(?: |$)/);
            var minNumber = Number(minObj[1]);
            if ($(this).val() != '') {
              if ($(this).val() < minNumber) {
                doError('min', $(this), index, val, minNumber);
              } else {
                doUnerror('min', $(this), index, val);
              }
            }
          });
        }
      });
    }

    /**
     * Error処理
     * @param  {String} errorType
     * @param  {Object} $this
     * @param  {Integer} index
     * @param  {Object} val
     * @param  {String} replacement
     */
    function doError(errorType, $this, index, val, replacement) {
      showAddError(errorType, $this);
      showErrorMessage(errorType, $this, replacement);
      saveErrorData(errorType, index, val);
    }

    /**
     * UNError処理
     * @param  {String} errorType
     * @param  {Object} $this
     * @param  {Integer} index
     * @param  {Object} val
     * @param  {String} replacement
     */
    function doUnerror(errorType, $this, index, val) {
      removeAddedError(errorType, $this);
      deleteErrorMessage(errorType, $this);
      deleteErrorData(errorType, index, val);
    }

    /**
     * Errorの際にclassを追加する
     * @param  {String} errorType
     * @param  {Object} $this
     * @return {Boolean}
     */
    function showAddError(errorType, $this) {
      if (errorAddClassTarget !== false) {
        $errorAddClassTarget = $this.closest(errorAddClassTarget);
        $errorAddClassTarget.addClass(errorAddClass);
        return true;
      }
      return false;
    }

    /**
     * 追加したErrorClassを削除する
     * @param  {String} errorType
     * @param  {Object} $this
     * @return {Boolean}
     */
    function removeAddedError(errorType, $this) {
      if (errorAddClassTarget !== false) {
        $errorAddClassTarget = $this.closest(errorAddClassTarget);
        $errorAddClassTarget.removeClass(errorAddClass);
        return true;
      }
      return false;
    }

    /**
     * Errorのメッセージを表示する
     * @param  {String} errorType
     * @param  {Object} $this
     * @param  {String} replacement メッセージを置換する文字列
     * @return {Boolean}
     */
    function showErrorMessage(errorType, $this, replacement) {
      if (errorMessagePosition !== false) {
        // エラーメッセージ
        var message = null;
        // nameに対するmessageが設定されているか
        var key = $this.attr('name');
        Object.keys(messages).forEach(function(key) {
          if ($this.attr('name') == key) {
            var rule = this[key];
            if (rule[errorType]) {
              message = rule[errorType];
            }
          }
        }, messages);
        // デフォルトErrorMessage
        if (message == null) {
          Object.keys(messages.default).forEach(function(key) {
            if (errorType === key) {
              message = this[key];
            }
          }, messages.default);
        }
        // エラーメッセージを修正する
        if (replacement != null) {
          message = message.replace('[[]]', replacement);
        }

        // errorTypeを含めたclassを追加
        var errorTypeClassName = 'easyValidate-' + errorType
        var addClassName = errorMessageClass + ' ' + errorTypeClassName;
        var errorMessageElement = $(errorMessageTag, errorMessageAttr).addClass(addClassName).text(message);
        // エラーメッセージを表示するContainerがあれば表示位置を変える
        var $errorMessageContainer = $this;
        if ($this.prop('className').match(/(?:^| )validation-errorMessageContainer-([a-zA-Z0-9_-]*)(?: |$)/)) {
          var container = $this.prop('className').match(/(?:^| )validation-errorMessageContainer-([a-zA-Z0-9_-]*)(?: |$)/);
          // 対象のClassを整形
          var targetClass = toClassString(container[1]);
          // エラーメッセージを表示するContainer
          $errorMessageContainer = $this.closest(targetClass);
        }
        // errorTypeClassがないときだけ追加する
        if (!$errorMessageContainer.siblings('.' + errorTypeClassName).hasClass(errorTypeClassName)) {
          if (errorMessagePosition === 'bottom') {
            $errorMessageContainer.after(errorMessageElement);
          } else if (errorMessagePosition === 'top') {
            $errorMessageContainer.before(errorMessageElement);
          }
        }
        return true;
      }
      return false;
    }

    /**
     * 追加したError Messageを消す
     * @param  {String} errorType
     * @param  {Object} $this
     * @return {Boolean}
     */
    function deleteErrorMessage(errorType, $this) {
      if (errorMessagePosition !== false) {
        // エラーメッセージを表示するContainerがあれば表示位置を変える
        var $errorMessageContainer = $this;
        if ($this.prop('className').match(/(?:^| )validation-errorMessageContainer-([a-zA-Z0-9_-]*)(?: |$)/)) {
          var container = $this.prop('className').match(/(?:^| )validation-errorMessageContainer-([a-zA-Z0-9_-]*)(?: |$)/);
          // 対象のClassを整形
          var targetClass = toClassString(container[1]);
          // エラーメッセージを表示するContainer
          $errorMessageContainer = $this.closest(targetClass);
        }
        $errorMessageContainer.siblings('.easyValidate-' + errorType).remove();
        return true;
      }
      return false;
    }

    /**
     * Errorsにsaveする
     * @param  {Object} errorType
     * @param  {Integer} index
     * @param  {Object} val
     */
    function saveErrorData(errorType, index, val) {
      if (errors[index] == null) {
        var row = [];
      } else {
        var row = errors[index];
      }
      row.push(errorType);
      errors[index] = row;
    }

    /**
     * Errorsからdeleteする
     * @param  {Object} errorType
     * @param  {Integer} index
     * @param  {Object} val
     */
    function deleteErrorData(errorType, index, val) {
      if (errors[index] != null) {
        var row = errors[index];
        for (var i = 0; i < row.length; i++) {
          if (row[i] == errorType) {
            row.splice(i, 1);
          }
        }
        if (row == null) {
          delete errors[index];
        } else {
          errors[index] = row;
        }
      }
    }

    /**
     * isNumber
     * @return {Boolean}
     */
    function isNumber(x) {
      if (typeof(x) != 'number' && typeof(x) != 'string') {
        return false;
      } else {
        return (x == parseFloat(x) && isFinite(x));
      }
    }

    return this;
  };

  /**
   * checkboxが選択されているか
   * @param  {Objects}  $checkboxes
   * @return {Boolean}
   */
  function isChecked($checkboxes) {
    var checked = false;
    $.each($checkboxes, function(index, value) {
      // $checkboxes.each(function(index, val) {
      if ($(this).prop("checked")) {
        checked = true;
        return false;
      }
    });
    return checked;
  }

  /**
   * selectが選択されているか
   * @param  {Object}  $this
   * @return {Boolean}
   */
  function isSelected($this) {
    // 例外項目を取得する
    var excepts = [];
    if ($this.prop('className').match(/(?:^| )validation-except-([^\s]*)(?: |$)/)) {
      excepts = $this.prop('className').match(/(?:^| )validation-except-([^\s]*)(?: |$)/)[1];
      excepts = excepts.split(",");
    }
    if ($this.val() == '' || excepts.indexOf($this.val()) >= 0) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * aaa bbb を.aaa.bbbに変更
   * @param  {String} str
   * @return {String}
   */
  function toClassString(str) {
    str = str.replace(/^\s+|\s+$/g, '').replace(/ +/g, ' '); // 連続する半角スペースを１つにまとめる
    str = '.' + str.replace(/ /g, '.');
    return str;
  }

  // デフォルトオプション
  $.fn.easyValidate.defaults = {
    messages: {
      'default': {
        'required': '必須項目です。',
        'required-checkbox': '必須項目です。',
        'required-select': '必須項目です。',
        'email': 'メールアドレスを入力してください。',
        'equalTo': '値が同じではありません',
        'tel': '電話番号の形式が違います。',
        'url': 'URLを入力してください。',
        'number': '数値を入力してください。',
        'max': '[[]]より小さい数値を入力してください。',
        'min': '[[]]より大きい数値を入力してください。'
      }
    },
    errorMessagePosition: 'bottom', // top|bottom|false
    errorMessageTag: '<div></div>',
    errorMessageClass: '.validation-error',
    errorMessageAttr: {},
    errorAddClassTarget: ".form_row", // .hoge|false
    errorAddClass: ".form_row-error",
  };
})(jQuery);
