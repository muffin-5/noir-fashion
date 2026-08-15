from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Categories, Products, Reviews, Cart, Orders, OrderItems, Customers


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Categories
        fields = ['category_id', 'name', 'product_count']


class ProductSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source='category.name', read_only=True)
    category_id = serializers.IntegerField(source='category.category_id', read_only=True)
    image_url = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Products
        fields = [
            'product_id', 'name', 'image_url', 'price', 'stock_quantity',
            'description', 'category', 'category_id', 'average_rating',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        url = obj.image.url if obj.image else None
        if url and request:
            return request.build_absolute_uri(url)
        return url

    def get_average_rating(self, obj):
        reviews = obj.reviews_set.all()
        if not reviews:
            return None
        total = sum(r.rating for r in reviews)
        return round(total / len(reviews), 1)


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.first_name', read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Products.objects.all(), write_only=True, required=False)
    customer = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Reviews
        fields = ['review_id', 'product', 'customer', 'customer_name', 'rating', 'comment', 'review_date']
        read_only_fields = ['review_id', 'customer', 'customer_name', 'review_date']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def create(self, validated_data):
        request = self.context.get('request')
        customer = Customers.objects.filter(email=request.user.email).first()
        if not customer:
            customer = Customers.objects.create(
                first_name=request.user.first_name or request.user.username,
                last_name=request.user.last_name,
                email=request.user.email,
                phone_no=0,
                password='',
                shipping_address='',
                billing_address='',
            )
        validated_data['customer'] = customer
        validated_data['review_date'] = timezone.now().date()
        return super().create(validated_data)


class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['cart_id', 'product', 'product_id', 'quantity', 'subtotal']
        read_only_fields = ['cart_id']

    def get_subtotal(self, obj):
        return round(obj.product.price * obj.quantity, 2)

    def create(self, validated_data):
        request = self.context.get('request')
        product_id = validated_data.pop('product_id')
        quantity = validated_data.get('quantity', 1)
        product = Products.objects.get(product_id=product_id)
        cart_item, created = Cart.objects.get_or_create(
            user=request.user, product=product,
            defaults={'quantity': quantity},
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        return cart_item


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItems
        fields = ['order_item_id', 'product', 'quantity', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True, source='orderitems_set')
    placed_at = serializers.DateTimeField(source='order_date', read_only=True)

    class Meta:
        model = Orders
        fields = ['order_id', 'total_amount', 'items', 'placed_at']


class CheckoutSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=255)
    last_name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    phone_no = serializers.IntegerField()
    shipping_address = serializers.CharField()
    billing_address = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user

        customer = Customers.objects.create(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            email=validated_data['email'],
            phone_no=validated_data['phone_no'],
            password='',
            shipping_address=validated_data['shipping_address'],
            billing_address=validated_data.get('billing_address') or validated_data['shipping_address'],
        )

        cart_items = Cart.objects.filter(user=user)
        total = sum(item.product.price * item.quantity for item in cart_items)

        order = Orders.objects.create(user=user, customer=customer, total_amount=total)
        for item in cart_items:
            OrderItems.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                subtotal=item.product.price * item.quantity,
            )
        cart_items.delete()
        return order


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already exists.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']