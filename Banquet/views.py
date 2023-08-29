from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.core.serializers import serialize
from django.core.mail import send_mail
from django.core.mail import EmailMessage
import json
from datetime import timedelta
from decimal import Decimal
from Menu.models import *
from .models import *

from reportlab.lib.enums import *
from reportlab.lib.pagesizes import letter
from reportlab.platypus import *
from reportlab.lib.styles import *
from reportlab.lib.units import cm

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont





@login_required(login_url='/login/')
def home(request, dish_type=None, clientId=None):
    clientId = request.GET.get('editting-clientId')
    if clientId == "null":
        clientId=None
    dish_type = request.GET.get('dish-filter')
    if dish_type == "all" or dish_type == "null":
        dish_type = None
    try:
        current_user = User.objects.get(id=request.user.id)
        current_user_profiledata = ProfileData.objects.get(user=current_user)
    except ProfileData.DoesNotExist:
        current_user = User.objects.get(id=request.user.id)
        current_user_profiledata = ProfileData.objects.create(user=current_user, name="Введите имя",
                                                                surname="Введите фамилию", sex='m', 
                                                                patronymic="Введите отчество",
                                                                birthdate = None, number="Введите номер")
        
    
    try:
        banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
    except Banquet.DoesNotExist:
        banquet = Banquet.objects.create(owner=current_user_profiledata, is_ordered=False)

    
    if dish_type == None:
        try:
            current_dishes = Dish.objects.all()
            for current_dish in current_dishes:
                current_dish.tittle = current_dish.name
                current_dish.name = current_dish.name.replace(" ", "_")
                
        except Dish.DoesNotExist:
            return redirect('/')
        
        contex = {"current_dishes":current_dishes, "banquet":banquet}
        
    elif dish_type == 'samples':
        menu_samples = MenuSample.objects.all()

        current_dishes = None
        for menu in menu_samples:
            for current_dish in menu.dishes.all():
                current_dish.product.tittle = current_dish.product.name
                current_dish.product.name = current_dish.product.name.replace(" ", "_")

            
        contex = {
            "dish_type": dish_type,
            "current_dishes": menu_samples,
            "banquet":banquet
        }
      
    else:
        try:
            current_dishes = Dish.objects.filter(type=dish_type)
            for current_dish in current_dishes:
                current_dish.tittle = current_dish.name
                current_dish.name = current_dish.name.replace(" ", "_")
                
        except Dish.DoesNotExist:
            return redirect('/banquet')
      
        contex = {
            "dish_type": dish_type,
            "current_dishes": current_dishes,
            "banquet":banquet
        }


    if clientId:
        try:
            current_client = Client.objects.get(id=clientId)
            contex["current_client"] =  current_client
        except Client.DoesNotExist:
            pass
     
    serialized_menu_dishes = None
    menu_dishes = []
    if not current_dishes:
        current_dishes = menu_samples
        serialized_data = serialize('json', current_dishes)
        for menu_sample in MenuSample.objects.all():
            for dish_order in menu_sample.dishes.all():
                serialized_product = serialize('json', [dish_order.product])
                menu_dishes.append(json.loads(serialized_product)[0])


        serialized_menu_dishes = json.dumps(menu_dishes)
        


    client_data = []
    for client in banquet.clients.all():
        client_dishes = {}
        total = 0
        if client.menu:
            for menu_dish in client.menu.dishes.all():
                total += int(menu_dish.product.price)
        if client.dishes.all():
            for dish in client.dishes.all():
                client_dishes[dish.product.id] = dish.quantity
                total += int(dish.product.price) * dish.quantity
        if client.menu: menu = client.menu.id
        else: menu=None
        client_type = client.type
        client_data.append({
            client_type: {
                'quantity': client.quantity,
                'menu': menu,
                'additional': client_dishes,
                'total': total
            }
        })
    print(client_data)

    banquet_cost = banquet.total_price()

    dishes = {}
    for dish in Dish.objects.all():
        dishes[dish.id] = dict(name=dish.name, price=int(dish.price), qauntity=1)

    print(dishes)
    order = {
    'type':'Банкет',
    'clients':client_data,
    'price': banquet_cost,
    'waiters': int(banquet.quantity_count() / 20),
    'client_quantity' : banquet.quantity_count()
    }
           
    # generate_pdf(order, dishes)

    if "application/json" in request.META.get("HTTP_ACCEPT", ""):
        serialized_data = serialize('json', current_dishes)

        if serialized_menu_dishes:
            combined_data = {
                    "current_menu": json.loads(serialized_data),
                    "current_menu_dishes": json.loads(serialized_menu_dishes)
                }
            serialized_combined_data = json.dumps(combined_data)
            return JsonResponse(serialized_combined_data, safe=False)
        else: return JsonResponse(serialized_data, safe=False)
    else:
        menu_samples = MenuSample.objects.all()
        contex["menu_samples"] = menu_samples
        return render(request, 'Banquet/home.html', contex)    


def ordering(request):
    try:
        current_user = User.objects.get(id=request.user.id)
        current_user_profiledata = ProfileData.objects.get(user=current_user)
    except ProfileData.DoesNotExist:
        pass

    current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
    if "application/json" in request.META.get("HTTP_ACCEPT", ""):
        hours_quantity = request.GET.get("hours")
        if hours_quantity:
            total = current_banquet.total_price() + current_banquet.calculate_waiters() * int(hours_quantity) * 400
            response = {"total": total}
        else: response = None
        response = json.dumps(response)
        return JsonResponse(response, safe=False)
    
    if request.method == "POST":
        current_user = User.objects.get(id=request.user.id)
        current_user_profiledata = ProfileData.objects.get(user=current_user)

        current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
        delivery_addres = request.POST.get("delivery_addres")
        delivery_time = request.POST.get("delivery_time")  # Получение данных из формы
        date = request.POST.get("delivery_date")  # Получение даты заказа
        comment = request.POST.get("order_comments")  
        duration = request.POST.get("duration_time")  
        hours_quantity = request.POST.get("duration_time")  

        current_banquet.addres = delivery_addres
        current_banquet.delivery_time = delivery_time
        current_banquet.comment = comment
        current_banquet.duration = timedelta(hours=int(duration))
        current_banquet.date = date
        current_banquet.ordered_date = date
        cost = current_banquet.total_price() + current_banquet.calculate_waiters()  * int(hours_quantity) * 400
        current_banquet.cost = Decimal(cost)
        current_banquet.bonuses = cost * 0.01
        current_banquet.is_ordered = True
        current_banquet.save()
        current_user_profiledata.bonuses += current_banquet.bonuses  
        current_user_profiledata.save()

        # subject = 'Вам заказали банкет'
        # message = f'{request.user.email} заказал банкет'
        # from_email = 'theroflx@yandex.ru'
        # recipient_list = ['theroflx@yandex.ru']
        # send_mail(subject, message, from_email, recipient_list)

        # subject = 'Банкет'
        # message = 'Вы заказали банкет'
        # from_email = request.user.email
        # recipient_list = [request.user.email]
        # send_mail(subject, message, from_email, recipient_list)


        client_data = []
        for client in current_banquet.clients.all():
            client_dishes = {}
            total = 0
            if client.menu:
                for menu_dish in client.menu.dishes.all():
                    total += int(menu_dish.product.price)
            if client.dishes.all():
                for dish in client.dishes.all():
                    client_dishes[dish.product.id] = dish.quantity
                    total += int(dish.product.price) * dish.quantity
            if client.menu: menu = client.menu.id
            else: menu=None
            client_type = client.type
            client_data.append({
                client_type: {
                    'quantity': client.quantity,
                    'menu': menu,
                    'additional': client_dishes,
                    'total': total
                }
            })

        
        menus = {}
        for mune in MenuSample.objects.all():
            all_mune_dishes = []
            for mune_dish in mune.dishes.all():
                all_mune_dishes.append(mune_dish.id)
            menus[mune.id] = all_mune_dishes


        banquet_cost = current_banquet.total_price()
        dishes = {}
        for dish in Dish.objects.all():
            dishes[dish.id] = dict(name=dish.name, price=int(dish.price), qauntity=1)

        if int(current_banquet.quantity_count() / 20) == 0:
            waiters = 1
        else: waiters = int(current_banquet.quantity_count() / 20)
        order = {
        'type':'Банкет',
        'clients':client_data,
        'price': banquet_cost,
        'waiters':  waiters,
        'client_quantity' : current_banquet.quantity_count()
        }

        
        generate_pdf(order, dishes, menus, int(hours_quantity))
        return render(request, 'Banquet/ordering.html')       
    

    occupied_dates = []
    current_banquet = Banquet.objects.get(owner=current_user_profiledata, is_ordered=False)
    workers = int(current_banquet.quantity_count() / 20)
    if workers == 0:
        current_banquet.workers = 1
    else: current_banquet.workers = workers

    all_banquets = Banquet.objects.filter(is_ordered=True)
    for banquet in all_banquets:
        occupied_dates.append(banquet.ordered_date.strftime('%Y-%m-%d'))


    for client in current_banquet.clients.all():
        if client.menu is None and client.dishes.all().count() == 0:
              current_banquet.clients.remove(client)

    total = current_banquet.total_price()  + current_banquet.calculate_waiters() * 3 * 400
    contex = {
        'current_banquet':current_banquet,
        'occupied_dates':occupied_dates,
        'total':total
        }
    
    return render(request, 'Banquet/ordering.html', contex)       


def forJsonResopnses(request):
    dish_ids = request.GET.getlist('dish_ids[]', []) 
    dish_ids = map(int, dish_ids)
    dish_ids = list(dish_ids)   
    client_id = request.GET.get("client_id")

    
    filter_ = request.GET.get("action")
    response = []
    if filter_ == "dish":
        try:
            current_client = Client.objects.get(id=client_id)
            all_client_dishes = current_client.dishes.all()
            for client_dish in all_client_dishes:
                if client_dish.product.id in dish_ids:
                    response.append(client_dish.product.id)
        except:
            pass
    elif filter_ == "menu": 
        try:
            current_client = Client.objects.get(id=client_id)
            for dish_id in dish_ids:
                if current_client.menu.id == dish_id:
                    response.append(current_client.menu.id)
        except:
            pass
    
    if response:
        response = json.dumps(response)
    else:
        response = {'if_dish':False}
        response = json.dumps(response)
    
    return JsonResponse(response, safe=False)

    
def generate_pdf(order, dishes, menus, duration):
    def format_integer(integer):
        if isinstance(integer, int):
            integer_str = "{:,}".format(integer)  # Преобразование числа в строку с разделением тысяч
            parts = integer_str.split(",")

            # Разделение на разряды
            formatted_integer = ""
            while len(parts) > 0:
                if len(formatted_integer) > 0:
                    formatted_integer = " " + formatted_integer
                formatted_integer = parts[-1] + formatted_integer
                parts = parts[:-1]

            return formatted_integer
        else:
            return "Invalid input"
        
    styles = getSampleStyleSheet() 
    styles['Normal'].fontName='DejaVuSerif'
    styles['Normal'].alignment = TA_LEFT
    styles['Normal'].fontSize=10
    styles['Normal'].leftIndent=20
    styles['Heading1'].fontName='DejaVuSerif'
    styles['Heading1'].alignment = TA_CENTER
    styles['Heading1'].fontSize=36
    pdfmetrics.registerFont(TTFont('DejaVuSerif','test/DejaVuSerif.ttf', 'UTF-8'))
    pdfmetrics.registerFont(TTFont('TIMES','test/TIMES.TTF', 'UTF-8'))

    def AddOrder(doc):
        doc = AddTittle(doc)
        doc = AddClient(doc, order["clients"])
        return doc

    def AddTittle(doc):
        doc.append(Spacer(1, 20))
        doc.append(Paragraph(f'Ваш {order["type"]} на {order["client_quantity"]} человек:', styles["Heading1"]))
        doc.append(Spacer(1, 5))
    
        return doc


    def AddClient(doc, clients):
        doc.append(Spacer(1, 20))
        styles.add(ParagraphStyle(name='Client', fontSize=20, alignment=TA_LEFT, leftIndent=15))
        styles['Client'].fontName='TIMES'
        styles.add(ParagraphStyle(name='Menu', fontSize=15, alignment=TA_LEFT, leftIndent=20))
        styles['Menu'].fontName='TIMES'
        styles.add(ParagraphStyle(name='AdditionalDishes', fontSize=15, alignment=TA_LEFT, leftIndent=20))
        styles['AdditionalDishes'].fontName='TIMES'
        styles.add(ParagraphStyle(name='ClientDish', fontSize=10, alignment=TA_LEFT, leftIndent=25))
        styles['ClientDish'].fontName='TIMES'
        styles.add(ParagraphStyle(name='Waiters', fontSize=12.5, alignment=TA_LEFT, leftIndent=15))
        styles['Waiters'].fontName='TIMES'
        price_style = ParagraphStyle(name='Price', fontSize=10, alignment=TA_LEFT, leftIndent=25)
        price_style.fontName = 'TIMES'
        styles.add(price_style)
        
        price_style = ParagraphStyle(name='Price', fontSize=10, alignment=TA_LEFT, leftIndent=25)

        for client in clients:
            for client_id, client_data in client.items():
                template = "без названия" if client_id == "Введите клиента" else client_id
                doc.append(Spacer(1, 10))
                doc.append(Paragraph(f'Шаблон "{template}" на {client_data["quantity"]} человек', styles["Client"]))
                doc.append(Spacer(1, 10))
                if client_data["menu"]:
                    doc.append(Paragraph(f'Меню №{client_data["menu"]}', styles["Menu"]))
                    doc.append(Spacer(1, 5))
                    for menu_dish in menus[client_data["menu"]]:
                        menu_dish_data = dishes[menu_dish]
                        menu_dish = f'{menu_dish_data["name"]}'  + ' x '
                        menu_dish += f'{menu_dish_data["qauntity"]}' + ' шт. = '
                        menu_dish += f'{menu_dish_data["price"] * menu_dish_data["qauntity"]}' + ".00 руб."
                        doc.append(Paragraph(menu_dish, styles["ClientDish"]))


                if client_data["additional"]:
                    if client_data["menu"]:
                        doc.append(Paragraph(f'Дополнительные блюда:', styles["AdditionalDishes"]))
                        doc.append(Spacer(1, 5))
                
                    for additional_dish in client_data["additional"]:
                        dish = f'{dishes[additional_dish]["name"]}'  + ' x '
                        dish += f'{client_data["additional"][additional_dish]}' + ' шт. = '
                        dish += f'{dishes[additional_dish]["price"] * client_data["additional"][additional_dish]}' + ".00 руб."
                        doc.append(Paragraph(dish, styles["ClientDish"]))
                        doc.append(Spacer(1, 2))

                total = client_data["total"]
                subtotal = f'Подытог: {client_data["total"]}.00 руб. x {client_data["quantity"]} шт. = {format_integer(total * client_data["quantity"])}.00 руб.'
                doc.append(Paragraph(subtotal, styles["AdditionalDishes"]))
                    
                doc.append(Spacer(1, 5))

        doc.append(Spacer(1, 20))
        waiters = order['waiters']
        waiter_salary = 400
        service = waiters * waiter_salary * duration
        doc.append(Paragraph(f'Обслуживаение: {waiters} официантов x {waiter_salary}.00 руб./час * {duration} ч. = {format_integer(service)}.00 руб.',
                            styles["Waiters"]))
        doc.append(Spacer(1, 10))
        doc.append(Paragraph(f'Итого: {format_integer(int(order["price"]) + int(service))}.00 руб.', styles["Client"]))
        return doc

    document = []   
    document.append(Image('test/logo.png', 5*cm * 2, 5*cm))
    document = AddOrder(document)


    SimpleDocTemplate('test/test.pdf', pagesize=letter, rightMargin=12, leftMargin=12, topMargin=0, bottomMargin=6).build(document)

