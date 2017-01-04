require 'pp'

@threshold = 1
@scores = [1, 1, 1, 1, 1]

def overlap (a, b)
  @scores.size.times.reduce(0) { |sum, index|
    sum + (a[index] == b[index] ? @scores[index] : 0)
  }
end

@base_sets = [1,2,3,4,5].permutation(5).to_a

def find_overlapping_set (starting_value)
  result_sets = [starting_value]
  modified = true

  while modified
    next_set = @base_sets.find{ |a|
      result_sets.all? { |b|
        overlap(a, b) <= @threshold
      }
    }

    if next_set.nil?
      modified = false
    else
      #puts next_set.to_s + ': ' + result_sets.map{|b| overlap(next_set, b)}.to_s
      result_sets << next_set
    end
  end

  result_sets
end

def set_overlap (result_set)
  result_set.map{ |a|
    (result_set - [a]).map{ |b|
      overlap(a, b)
    }
  }
end

def max_overlap (result_set)
  set_overlap(result_set).flatten.max
end

def sum_overlap (result_set)
  set_overlap(result_set).flatten.reduce(&:+)
end

def value_distribution (result_set)
  result_set.first.size.times.map{|i|
    result_set.group_by{ |x|
      x[i]
    }.map{ |k,v|
      v.size
    }
  }.flatten.uniq.size
end

best_set = find_overlapping_set(@base_sets.first)
best_distribution = value_distribution(best_set)
best_max = max_overlap(best_set)
best_sum = sum_overlap(best_set)

#@base_sets.each_with_index do |a, i|
begin
  a = @base_sets.first
  i = 0
  puts "Set #{i}: #{a}"
  iteration = 0
  until iteration == @base_sets.size
    @base_sets.rotate!
    new_set = find_overlapping_set(a)
    new_distribution = value_distribution(new_set)
    new_max = max_overlap(new_set)
    new_sum = sum_overlap(new_set)
    if new_set.size > best_set.size or
        (new_set.size == best_set.size and (new_distribution < best_distribution or
            (new_distribution == best_distribution and (new_max < best_max or
                (new_max == best_max and new_sum < best_sum)
            ))
        ))
      if new_set.size > best_set.size
        puts "New Best Size! Old Size: #{best_set.size}, New Size: #{new_set.size}"
      elsif new_distribution < best_distribution
        puts "New Best Dist! Sizes: #{[best_set.size, new_set.size]}, Old Dist: #{best_distribution}, New Dist: #{new_distribution}"
      elsif new_max < best_max
        puts "New Best Max!  Sizes: #{[best_set.size, new_set.size]}, Dists: #{[best_distribution, new_distribution]}, Old Max: #{best_max}, New Max: #{new_max}"
      else
        puts "New Best Sum!  Sizes: #{[best_set.size, new_set.size]}, Dists: #{[best_distribution, new_distribution]}, Maxes: #{[best_max, new_max]}, Old Sum: #{best_sum}, New Sum: #{new_sum}"
      end
      best_set = new_set.sort
      best_distribution = new_distribution
      best_max = new_max
      best_sum = new_sum
      #puts "New Best! Size: #{best_set.size}, Distribution: #{best_distribution}, Max Match: #{best_max}, Overlap Sum: #{best_sum}"
    end
    iteration += 1
  end
end

pp best_set
pp best_distribution
pp best_set.sort.group_by{ |a1|
  overlap(a1, best_set.first)
}
