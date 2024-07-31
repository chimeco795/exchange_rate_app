$(document).ready(function () {
    let countryMap = {};

    function showToast(message, type = 'success') {
        var toastHtml = `
            <div class="toast align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>`;
        $('#toast-container').append(toastHtml);
        var toastElement = $('#toast-container .toast').last();
        var toast = new bootstrap.Toast(toastElement);
        toast.show();
        toastElement.on('hidden.bs.toast', function () {
            $(this).remove();
        });
    }

    $('#save-btn').on('click', function () {
        var data = [];
        var valid = true;
        $('input[name="valor"]').each(function () {
            var moneda = $(this).data('moneda');
            var valor = $(this).val();
            if (new RegExp('^\\d{0,3}(\\.\\d{0,5})?$').test(valor) && parseFloat(valor) >= 0) {
                data.push({ moneda: moneda, valor: parseFloat(valor).toFixed(5) });
            } else {
                showToast('Por favor, ingresa un valor numérico válido para ' + moneda, 'danger');
                valid = false;
                return false;
            }
        });

        if (valid) {
            $.ajax({
                url: '/update',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: function (response) {
                    if (response.success) {
                        showToast('Datos guardados exitosamente');
                    } else {
                        showToast(response.message, 'danger');
                    }
                }
            });
        }
    });

    $('#refresh-btn').on('click', function () {
        window.location.href = '/refresh';
    });

    $('#cancel-btn').on('click', function () {
        window.location.href = '/';
    });

    $('.currency-input').on('input', function () {
        this.value = this.value.replace(/[^0-9.]/g, '');
        if ((this.value.match(/\./g) || []).length > 1) {
            this.value = this.value.slice(0, -1);
        }
        if (/^\d{4,}$/.test(this.value.split('.')[0])) {
            this.value = this.value.slice(0, -1);
        }
        if (/\.\d{6,}$/.test(this.value)) {
            this.value = this.value.slice(0, -1);
        }
    });

    $('.currency-input').on('blur', function () {
        if (/^\d{0,3}(\.\d{0,5})?$/.test(this.value) && parseFloat(this.value) >= 0) {
            this.value = parseFloat(this.value).toFixed(5);
        } else {
            this.value = '';
        }
    });

    $('#sort-country').on('click', function () {
        var isSorted = $(this).hasClass('sorted');
        $('.sortable-header').removeClass('sorted');
        if (!isSorted) {
            $(this).addClass('sorted');
        }
        sortTable(0, $(this).hasClass('sorted'));
        $(this).toggleClass('asc').toggleClass('desc');
        $(this).find('i').toggleClass('fa-sort-alpha-up').toggleClass('fa-sort-alpha-down');
    });

    $('#sort-value').on('click', function () {
        var isSorted = $(this).hasClass('sorted');
        $('.sortable-header').removeClass('sorted');
        if (!isSorted) {
            $(this).addClass('sorted');
        }
        sortTable(1, $(this).hasClass('sorted'));
        $(this).toggleClass('asc').toggleClass('desc');
        $(this).find('i').toggleClass('fa-sort-numeric-up').toggleClass('fa-sort-numeric-down');
    });

    $('#search-input').on('input', function () {
        filterTable();
        $('#clear-search').toggle($(this).val().length > 0);
    });

    $('#clear-search').on('click', function () {
        $('#search-input').val('').trigger('input');
    });

    function sortTable(columnIndex, asc) {
        var table = $('#exchange-table tbody');
        var rows = table.find('tr').toArray().sort(comparer(columnIndex));
        if (!asc) { rows = rows.reverse(); }
        for (var i = 0; i < rows.length; i++) { table.append(rows[i]); }
    }

    function comparer(index) {
        return function (a, b) {
            var valA = getCellValue(a, index), valB = getCellValue(b, index);
            return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB);
        };
    }

    function getCellValue(row, index) {
        return $(row).children('td').eq(index).text().trim() || $(row).children('td').eq(index).find('input').val().trim();
    }

    function filterTable() {
        var input = $('#search-input').val().toLowerCase();
        $('#exchange-table tbody tr').filter(function () {
            var text = $(this).text().toLowerCase();
            var countryCode = $(this).find('.flag').data('country');
            var countryName = countryMap[countryCode] ? countryMap[countryCode].toLowerCase() : '';
            $(this).toggle(text.indexOf(input) > -1 || countryName.indexOf(input) > -1);
        });
    }

    function fetchCountryNames() {
        fetch('https://restcountries.com/v3.1/all')
            .then(response => response.json())
            .then(data => {
                data.forEach(country => {
                    countryMap[country.cca2.toLowerCase()] = country.name.common;
                });
                document.querySelectorAll('.flag').forEach(img => {
                    const countryCode = img.getAttribute('data-country');
                    img.setAttribute('title', countryMap[countryCode]);
                });
                $('[data-bs-toggle="tooltip"]').tooltip();
            })
            .catch(error => console.error('Error fetching country names:', error));
    }

    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 0) {
            $('#floating-controls').addClass('mini');
            $('.floating-controls .btn-text').hide();
            $('[data-bs-toggle="tooltip"]').tooltip();
        } else {
            $('#floating-controls').removeClass('mini');
            $('.floating-controls .btn-text').show();
            $('[data-bs-toggle="tooltip"]').tooltip('dispose');
        }
    });

    $('[data-bs-toggle="tooltip"]').tooltip();

    fetchCountryNames();
});
