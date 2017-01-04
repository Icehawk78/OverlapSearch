angular.module('overlapSearch', [])
    .controller('OverlapSearchController', function($sce) {
        let overlapSearch = this;
        overlapSearch.scores = [1, 1, 1, 1, 1];
        overlapSearch.values = [1, 2, 3, 4, 5];
        overlapSearch.minimum_overlap = 0;
        overlapSearch.maximum_overlap = 1;
        overlapSearch.sort_type = 'length';

        overlapSearch.permute = function(input, permArr, usedChars) {
            permArr = permArr || [];
            usedChars = usedChars || [];
            let i, ch;
            for (i = 0; i < input.length; i++) {
                ch = input.splice(i, 1)[0];
                usedChars.push(ch);
                if (input.length == 0) {
                    permArr.push(usedChars.slice());
                }
                overlapSearch.permute(input, permArr, usedChars);
                input.splice(i, 0, ch);
                usedChars.pop();
            }
            return permArr
        };

        overlapSearch.overlap = function(a, b) {
            let score = 0;
            for (let i=0; i < overlapSearch.scores.length; i++) {
                score += a[i] == b[i] ? overlapSearch.scores[i] : 0;
            }
            return score;
        };

        overlapSearch.update_sets = function() {
            overlapSearch.values = overlapSearch.values.map(i => {return parseInt(i, 10)});
            overlapSearch.scores = overlapSearch.scores.map(i => {return parseInt(i, 10)});
            overlapSearch.base_sets = overlapSearch.permute(overlapSearch.values);
            // overlapSearch.results = overlapSearch.find_overlapping_set([overlapSearch.base_sets[0]], overlapSearch.base_sets);
            overlapSearch.all_results = overlapSearch.find_all_overlapping_sets([overlapSearch.base_sets[0]], overlapSearch.base_sets);
        };

        overlapSearch.find_overlapping_set = function(starting_values, potential_matches) {
            let remaining_matches = potential_matches.filter(a => {
                return _.all(starting_values, function(b) {
                    let overlap = overlapSearch.overlap(a, b);
                    return overlap >= overlapSearch.minimum_overlap && overlap <= overlapSearch.maximum_overlap;
                });
            });
            if (remaining_matches.length > 0) {
                starting_values.push(remaining_matches[0]);
                return overlapSearch.find_overlapping_set(starting_values, remaining_matches);
            } else {
                return starting_values;
            }
        };

        overlapSearch.find_all_overlapping_sets = function(starting_values, potential_matches) {
            let remaining_matches = potential_matches.filter(a => {
                return _.all(starting_values, function(b) {
                    let overlap = overlapSearch.overlap(a, b);
                    return overlap >= overlapSearch.minimum_overlap && overlap <= overlapSearch.maximum_overlap;
                });
            });
            if (remaining_matches.length > 0) {
                return _.sortBy(remaining_matches.map(m => {
                    let new_values = _.clone(starting_values);
                    new_values.push(m);
                    return overlapSearch.find_overlapping_set(new_values, remaining_matches);
                }), arr => {return -arr.length});
            } else {
                return starting_values.sort();
            }
        };

        overlapSearch.display_set = function(set) {
            return $sce.trustAsHtml(set.join("<br />"));
        };

        overlapSearch.value_distribution = function(set) {
            return _.unique(_.flatten(_.range(set[0].length).map(i => {
                return _.map(_.groupBy(set, s => {return s[i]}), (s, k) => {return s.length});
            }))).length;
        };

        overlapSearch.base_sets = overlapSearch.permute(overlapSearch.values);
        // overlapSearch.results = overlapSearch.find_overlapping_set([overlapSearch.base_sets[0]], overlapSearch.base_sets);
        overlapSearch.all_results = overlapSearch.find_all_overlapping_sets([overlapSearch.base_sets[0]], overlapSearch.base_sets);
    })
    .directive('integer', function(){
        return {
            require: 'ngModel',
            link: function(scope, ele, attr, ctrl){
                ctrl.$parsers.unshift(function(viewValue){
                    return parseInt(viewValue, 10);
                });
            }
        };
    });
