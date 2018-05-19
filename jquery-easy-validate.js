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
        var addErrorElement = options.addErrorElement;
        var addErrorClass = options.addErrorClass;
        var messages = options.messages;
        var errorMessagePosition = options.errorMessagePosition;
        var errorMessageClass = options.errorMessageClass;
        var errorMessageAttr = {
            addClass: errorMessageClass.replace('.', "")
        };
        var errors = {};

        /* 要素に実行 */
        elements.each(function() {
            $(this).find('*[class^="validation"]').each(function() {
                // エラーメッセージ用のdivを追加
                if (errorMessagePosition === 'bottom') {
                    $(this).after($("<div></div>", errorMessageAttr));
                } else if (errorMessagePosition === 'top') {
                    $(this).before($("<div></div>", errorMessageAttr));
                }
            });

            // Validate
            validate($(this));

            // Buttonクリック時
            $(this).find('form').submit(function() {
                // 強制的にValidate
                $(this).find('*[class^="validation"]').each(function(index, val) {
                    $(this).focus().blur();
                });
                // エラーがあったらsubmitをキャンセル
                if (Object.keys(errors).length !== 0) {
                    console.log(errors);
                    return false;
                }
            });
        });


        /**
         * Validate
         * @return errors
         */
        function validate($this) {
            $this.find('*[class^="validation"]').each(function(index, val) {
                // 必須項目
                if ($(this).hasClass('validation-required')) {
                    $(this).on('blur', function() {
                        if ($(this).val() == "") {
                            showAddError('required', $(this));
                            showErrorMessage('required', $(this));
                            errors.index = $(this);
                        } else {
                            removeAddedError('required', $(this));
                            deleteErrorMessage('required', $(this));
                            delete errors.index;
                        }
                    });
                }
                //メールアドレス
                if ($(this).hasClass('validation-email')) {
                    $(this).on('blur', function() {
                        if (!$(this).val().match(/^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/)) {
                            showAddError('email', $(this));
                            showErrorMessage('email', $(this));
                            errors.index = $(this);
                        } else {
                            removeAddedError('email', $(this));
                            deleteErrorMessage('email', $(this));
                            delete errors.index;
                        }
                    });
                }
                //電話番号入力チェック
                if ($(this).hasClass('validation-tel')) {
                    $(this).on('blur', function() {
                        if (!$(this).val().match(/^0\d{1,4}-\d{1,4}-\d{3,4}$/)) {
                            showAddError('tel', $(this));
                            showErrorMessage('tel', $(this));
                            errors.index = $(this);
                        } else {
                            removeAddedError('tel', $(this));
                            deleteErrorMessage('tel', $(this));
                            delete errors.index;
                        }
                    });
                }
                // URL
                if ($(this).hasClass('validation-url')) {
                    $(this).on('blur', function() {
                        if (!$(this).val().match(/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?/)) {
                            showAddError('url', $(this));
                            showErrorMessage('url', $(this));
                            errors.index = $(this);
                        } else {
                            removeAddedError('url', $(this));
                            deleteErrorMessage('url', $(this));
                            delete errors.index;
                        }
                    });
                }
            });
        }

        /**
         * Errorの際にclassを追加する
         * @param  {[type]} errorType [description]
         * @param  {[type]} $this     [description]
         * @return 追加したElement
         */
        function showAddError(errorType, $this) {
            $addErrorElement = $this.closest(addErrorElement);
            $addErrorElement.addClass(addErrorClass);
            return $addErrorElement;
        }

        /**
         * Errorのメッセージを表示する
         * @param  {[type]} errorType [description]
         * @param  メッセージを表示する際に検索する元となるElement
         */
        function showErrorMessage(errorType, $this) {
            if (errorMessagePosition !== false) {
                Object.keys(messages.error).forEach(function(key) {
                    if (errorType === key) {
                        var val = this[key];
                        $this.siblings(errorMessageClass).text(val);
                    }
                }, messages.error);
            }
        }

        /**
         * 追加したErrorClassを削除する
         * @param  {[type]} errorType [description]
         * @param  {[type]} $this     [description]
         */
        function removeAddedError(errorType, $this) {
            $addErrorElement = $this.closest(addErrorElement);
            $addErrorElement.removeClass(addErrorClass);
            return $addErrorElement;
        }

        /**
         * 追加したError Messageを消す
         * @param  {[type]} errorType [description]
         * @param  {[type]} $this     [description]
         */
        function deleteErrorMessage(errorType, $this) {
            if (errorMessagePosition !== false) {
                $this.siblings(errorMessageClass).text('');
            }
        }

        return this;
    };

    // デフォルトオプション
    $.fn.easyValidate.defaults = {
        addErrorElement: ".form_row",
        addErrorClass: "form_row-error",
        messages: {
            'error': {
                'required': '必須項目です。',
                'email': 'メールアドレスを入力してください。',
                'tel': '電話番号の形式が違います。',
                'url': 'URLを入力してください。'
            }
        },
        errorMessagePosition: 'bottom', // top|bottom|false
        errorMessageClass: '.validation-error'
    };
})(jQuery);
