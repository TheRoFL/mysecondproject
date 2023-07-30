from django import template

register = template.Library()

@register.filter
def repeat_times(number):
    return range(number)