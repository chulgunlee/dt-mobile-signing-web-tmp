(function($) {
    $.fn.pluralize = function(s, pl)
    {
        var n = parseInt(s);
        if ((isNaN(n) || n % 10 === 1) && n % 100 !== 11) return s;
        if (!pl) return s + 's';
        return s.replace(/\S+(\s*)$/, pl + '$1');
    };
})(jQuery);