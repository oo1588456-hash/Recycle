"""
Create five dummy buyer accounts with realistic data for cart, orders, and chat.

Usage (from backend/):
  python manage.py seed_dummy_buyers
  python manage.py seed_dummy_buyers --password MySecret123
  python manage.py seed_dummy_buyers --reset-dummies   # remove prior seed rows, then recreate

Requires categories in the DB (run migrations). Creates a dedicated seed seller and
listings used only for this dummy data.
"""

from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.cart.models import Cart, CartItem
from apps.categories.models import Category
from apps.chat.models import Message
from apps.orders.models import Order, OrderItem
from apps.products.models import ProductListing

User = get_user_model()

SEED_ORDER_NOTES = "[seed:dummy_buyers]"
SEED_MSG_PREFIX = "[seed] "

DUMMY_EMAILS = [
    "dummy.buyer1@recycle.local",
    "dummy.buyer2@recycle.local",
    "dummy.buyer3@recycle.local",
    "dummy.buyer4@recycle.local",
    "dummy.buyer5@recycle.local",
]

SEED_SELLER_EMAIL = "dummy.seed.seller@recycle.local"


def _upsert_buyer(
    *,
    email: str,
    username: str,
    full_name: str,
    phone: str,
    password: str,
) -> User:
    u, _created = User.objects.get_or_create(
        email=email,
        defaults={
            "username": username,
            "full_name": full_name,
            "phone_number": phone,
            "role": User.Role.BUYER,
            "seller_account_status": User.SellerAccountStatus.NA,
        },
    )
    u.username = username
    u.full_name = full_name
    u.phone_number = phone
    u.role = User.Role.BUYER
    u.seller_account_status = User.SellerAccountStatus.NA
    u.is_active = True
    u.is_blocked = False
    u.set_password(password)
    u.save()
    return u


def _upsert_seed_seller(password: str) -> User:
    u, _created = User.objects.get_or_create(
        email=SEED_SELLER_EMAIL,
        defaults={
            "username": "dummyseedseller",
            "full_name": "Seed Listings Seller",
            "role": User.Role.SELLER,
            "seller_account_status": User.SellerAccountStatus.APPROVED,
        },
    )
    u.username = "dummyseedseller"
    u.full_name = "Seed Listings Seller"
    u.role = User.Role.SELLER
    u.seller_account_status = User.SellerAccountStatus.APPROVED
    u.is_active = True
    u.is_blocked = False
    u.set_password(password)
    u.save()
    return u


def _ensure_seed_products(seller: User, count: int = 8) -> list[ProductListing]:
    cat = Category.objects.filter(is_active=True).order_by("pk").first()
    titles = [
        "Seed — USB-C hub (dummy listing)",
        "Seed — Wireless mouse (dummy listing)",
        "Seed — Bluetooth speaker (dummy listing)",
        "Seed — Phone case bundle (dummy listing)",
        "Seed — Laptop stand (dummy listing)",
        "Seed — LED desk lamp (dummy listing)",
        "Seed — Portable SSD (dummy listing)",
        "Seed — Noise-cancelling buds (dummy listing)",
    ]
    out: list[ProductListing] = []
    for i in range(min(count, len(titles))):
        title = titles[i]
        p, _created = ProductListing.objects.get_or_create(
            seller=seller,
            title=title,
            defaults={
                "category": cat,
                "description": "Auto-generated listing for buyer dummy data. Safe to delete after demos.",
                "brand": "SeedBrand",
                "model_name": f"SB-{i + 1}",
                "original_price": Decimal("120.00"),
                "final_price": Decimal("79.99") + Decimal(i),
                "currency": getattr(settings, "DEFAULT_CURRENCY", "GBP"),
                "status": ProductListing.Status.ACTIVE,
                "stock_quantity": 20,
                "location": "London, UK",
                "user_declared_condition": ProductListing.Condition.GOOD,
            },
        )
        if p.status != ProductListing.Status.ACTIVE or p.final_price is None:
            p.status = ProductListing.Status.ACTIVE
            p.final_price = p.final_price or Decimal("79.99")
            p.stock_quantity = max(p.stock_quantity, 5)
            p.save()
        out.append(p)
    return out


def _clear_prior_seed_data() -> None:
    Order.objects.filter(buyer__email__in=DUMMY_EMAILS, notes__contains=SEED_ORDER_NOTES).delete()
    Message.objects.filter(sender__email__in=DUMMY_EMAILS, message__startswith=SEED_MSG_PREFIX).delete()
    CartItem.objects.filter(cart__buyer__email__in=DUMMY_EMAILS).delete()


def _replenish_seed_listings(seller: User) -> None:
    """Reset stock on auto-generated dummy listings so re-running the command is safe."""
    ProductListing.objects.filter(seller=seller, title__contains="dummy listing").update(
        stock_quantity=20,
        status=ProductListing.Status.ACTIVE,
    )


def _make_order(
    *,
    buyer: User,
    seller: User,
    products: list[tuple[ProductListing, int]],
    status: str,
    payment_status: str,
) -> Order:
    total = Decimal("0")
    for p, qty in products:
        total += Decimal(str(p.final_price)) * qty
    order = Order.objects.create(
        buyer=buyer,
        seller=seller,
        order_number=Order.generate_order_number(),
        total_amount=total,
        currency=products[0][0].currency or getattr(settings, "DEFAULT_CURRENCY", "GBP"),
        status=status,
        payment_method=Order.PaymentMethod.CASH_ON_DELIVERY,
        payment_status=payment_status,
        shipping_address="10 Seed Street, Demo City, UK",
        buyer_phone=buyer.phone_number or "+441234567890",
        notes=f"{SEED_ORDER_NOTES} demo order",
    )
    for p, qty in products:
        OrderItem.objects.create(
            order=order,
            product=p,
            seller=seller,
            price=p.final_price,
            quantity=qty,
        )
        p.stock_quantity = max(0, p.stock_quantity - qty)
        if p.stock_quantity == 0:
            p.status = ProductListing.Status.SOLD
        p.save(update_fields=["stock_quantity", "status", "updated_at"])
    return order


class Command(BaseCommand):
    help = "Create 5 dummy buyers with cart, order, and chat sample data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default="Buyer12345",
            help="Password for all dummy buyer accounts (default: Buyer12345).",
        )
        parser.add_argument(
            "--reset-dummies",
            action="store_true",
            help="Same as default: seed rows are always cleared before recreate (kept for CLI compatibility).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        password: str = options["password"]
        if options["reset_dummies"]:
            self.stdout.write("(Note: seed data is cleared on every run for idempotency.)")

        seller = _upsert_seed_seller(password="Seller12345")
        _clear_prior_seed_data()
        _replenish_seed_listings(seller)
        self.stdout.write("Cleared prior seed cart lines, orders, messages; replenished seed listing stock.")

        _ensure_seed_products(seller, count=8)
        products = list(
            ProductListing.objects.filter(
                seller=seller,
                status=ProductListing.Status.ACTIVE,
                stock_quantity__gte=2,
            ).order_by("pk")[:8]
        )

        if len(products) < 5:
            self.stdout.write(self.style.ERROR("Could not create enough active products for dummy data."))
            return

        p = products

        buyers_spec = [
            {
                "email": DUMMY_EMAILS[0],
                "username": "dummybuyer1",
                "full_name": "Ava Chen",
                "phone": "+447700900001",
                "blurb": "Cart: two items; platform support message (if a superadmin exists).",
            },
            {
                "email": DUMMY_EMAILS[1],
                "username": "dummybuyer2",
                "full_name": "Leo Wright",
                "phone": "+447700900002",
                "blurb": "Order history: one delivered order (my orders).",
            },
            {
                "email": DUMMY_EMAILS[2],
                "username": "dummybuyer3",
                "full_name": "Maya Patel",
                "phone": "+447700900003",
                "blurb": "Cart + pending order + seller message (checkout + chat).",
            },
            {
                "email": DUMMY_EMAILS[3],
                "username": "dummybuyer4",
                "full_name": "Noah Silva",
                "phone": "+447700900004",
                "blurb": "Seller chat: product inquiry thread.",
            },
            {
                "email": DUMMY_EMAILS[4],
                "username": "dummybuyer5",
                "full_name": "Emma Jones",
                "phone": "+447700900005",
                "blurb": "One shipped order + cart with one item (mixed state).",
            },
        ]

        buyers: list[User] = []
        for spec in buyers_spec:
            buyers.append(
                _upsert_buyer(
                    email=spec["email"],
                    username=spec["username"],
                    full_name=spec["full_name"],
                    phone=spec["phone"],
                    password=password,
                )
            )

        b0, b1, b2, b3, b4 = buyers

        # Refresh product rows after any prior logic (stock intact except we may create fresh)
        p = list(
            ProductListing.objects.filter(
                seller=seller,
                status=ProductListing.Status.ACTIVE,
                stock_quantity__gte=1,
            ).order_by("pk")[:8]
        )

        # 1 — Ava: cart + optional support thread
        cart0, _ = Cart.objects.get_or_create(buyer=b0)
        CartItem.objects.update_or_create(cart=cart0, product=p[0], defaults={"quantity": 1})
        CartItem.objects.update_or_create(cart=cart0, product=p[1], defaults={"quantity": 2})
        admin_user = (
            User.objects.filter(role=User.Role.SUPERADMIN, is_active=True).order_by("pk").first()
        )
        if admin_user:
            Message.objects.create(
                sender=b0,
                receiver=admin_user,
                product=None,
                order=None,
                message=f"{SEED_MSG_PREFIX}Hi support — I cannot find the checkout button on mobile. Thanks!",
            )

        # 2 — Leo: delivered order
        _make_order(
            buyer=b1,
            seller=seller,
            products=[(p[2], 1)],
            status=Order.Status.DELIVERED,
            payment_status=Order.PaymentStatus.PAID,
        )

        # 3 — Maya: cart + pending order + message
        cart2, _ = Cart.objects.get_or_create(buyer=b2)
        CartItem.objects.update_or_create(cart=cart2, product=p[3], defaults={"quantity": 1})
        _make_order(
            buyer=b2,
            seller=seller,
            products=[(p[4], 1)],
            status=Order.Status.PENDING,
            payment_status=Order.PaymentStatus.UNPAID,
        )
        Message.objects.create(
            sender=b2,
            receiver=seller,
            product=p[4],
            message=f"{SEED_MSG_PREFIX}Hi — I just placed an order for this item. What is your usual dispatch time?",
        )

        # 4 — Noah: product message only
        Message.objects.create(
            sender=b3,
            receiver=seller,
            product=p[5],
            message=f"{SEED_MSG_PREFIX}Is this still available? Any scratches on the body?",
        )

        # 5 — Emma: shipped order + cart
        _make_order(
            buyer=b4,
            seller=seller,
            products=[(p[6], 1)],
            status=Order.Status.SHIPPED,
            payment_status=Order.PaymentStatus.PAID,
        )
        cart4, _ = Cart.objects.get_or_create(buyer=b4)
        # Use a product still in stock with quantity left (p[7] or first with stock >=2)
        extra = p[7] if len(p) > 7 else p[0]
        CartItem.objects.update_or_create(cart=cart4, product=extra, defaults={"quantity": 1})

        self.stdout.write(self.style.SUCCESS("\nDummy buyers (password for all: %s)\n" % password))
        for spec, buyer in zip(buyers_spec, buyers, strict=True):
            self.stdout.write(f"  - {spec['full_name']}  {spec['email']}  ({spec['username']})")
            self.stdout.write(f"    {spec['blurb']}")
        self.stdout.write(f"\nDedicated listings seller: {seller.email} / Seller12345")
        self.stdout.write("Re-run this command any time; it clears seed-tagged rows and replenishes seed listing stock first.")
