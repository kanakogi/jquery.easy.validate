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
        var messages = options.messages;
        var errorMessagePosition = options.errorMessagePosition;
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
                $(this).find('*[class^="validation"]').each(function(index, val) {
                    $(this).focus().blur();
                });
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
            $this.find('*[class^="validation"]').each(function(index, val) {
                // 必須項目
                if ($(this).hasClass('validation-required')) {
                    $(this).on('blur', function() {
                        if ($(this).val() == "") {
                            doError('required', $(this), index, val, null);
                        } else {
                            doUnerror('required', $(this), index, val);
                        }
                    });
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
                var text;
                Object.keys(messages.error).forEach(function(key) {
                    if (errorType === key) {
                        text = this[key];
                        // エラーメッセージを修正する
                        if (replacement != null) {
                            text = text.replace('[[]]', replacement);
                        }
                    }
                }, messages.error);
                // errorTypeを含めたclassを追加
                var errorTypeClassName = 'easyValidate-' + errorType
                var addClassName = errorMessageClass + ' ' + errorTypeClassName;
                var errorMessageElement = $("<div></div>", errorMessageAttr).addClass(addClassName).text(text);
                // errorTypeClassがないときだけ追加する
                if (!$this.siblings('.' + errorTypeClassName).hasClass(errorTypeClassName)) {
                    if (errorMessagePosition === 'bottom') {
                        $this.after(errorMessageElement);
                    } else if (errorMessagePosition === 'top') {
                        $this.before(errorMessageElement);
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
                $this.siblings('.easyValidate-' + errorType).remove();
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

    // デフォルトオプション
    $.fn.easyValidate.defaults = {
        messages: {
            'error': {
                'required': '必須項目です。',
                'email': 'メールアドレスを入力してください。',
                'tel': '電話番号の形式が違います。',
                'url': 'URLを入力してください。',
                'number': '数値を入力してください。',
                'max': '[[]]より小さい数値を入力してください。',
                'min': '[[]]より大きい数値を入力してください。'
            }
        },
        errorMessagePosition: 'bottom', // top|bottom|false
        errorMessageClass: '.validation-error',
        errorMessageAttr: {},
        errorAddClassTarget: ".form_row", // .hoge|false
        errorAddClass: ".form_row-error",
    };
})(jQuery);
